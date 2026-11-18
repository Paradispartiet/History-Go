// Explicitly consented ORS detour check for a PUBLIC Fysen restaurant candidate.
// Both direct and via-stop journeys are routed in the same request session.
// Pass-time and detour are valid only for this planning context: they do NOT
// establish kitchen hours, inventory, prices, actual visits or meal offers.
(function () {
  "use strict";
  const W = /** @type {any} */ (window);
  const MODES = {walking:"foot-walking",cycling:"cycling-regular",driving:"driving-car"};
  const ORS_ORIGIN = "https://api.openrouteservice.org";
  function atTime(value) {
    return value && typeof value.getTime === "function" ? Number(value.getTime()) : Number(value);
  }
  function numeric(value,min,max) {
    return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
  }
  function point(raw) {
    return !!raw && numeric(raw.latitude,-90,90) && numeric(raw.longitude,-180,180);
  }
  function sourceFresh(proof, now) {
    const checked=Date.parse(proof?.checkedAt || "");
    const until=Date.parse(proof?.validUntil || "");
    return Number.isFinite(checked) && Number.isFinite(until) && checked<=now && until>now &&
      /^https:\/\/api\.openrouteservice\.org\/v2\/directions\/(foot-walking|cycling-regular|driving-car)\/geojson$/.test(proof?.sourceUrl||"");
  }
  function validRoad(route, now) {
    const points=route?.roadGeometry?.coordinates;
    return route?.kind==="commute" && route.status==="planned" &&
      route.visibility==="private" && route.routingStatus==="verified_route" &&
      !!route.id && /^ors-geometry-v1-[a-f0-9]{8}$/.test(route.geometryRevision||"") &&
      route.roadGeometry?.type==="LineString" && Array.isArray(points) &&
      points.length>=2 && points.length<=10000 &&
      points.every(row=>Array.isArray(row)&&row.length===2&&numeric(row[0],-180,180)&&numeric(row[1],-90,90)) &&
      Array.isArray(route.waypoints) && route.waypoints.length===2 &&
      route.waypoints.every(point) && sourceFresh(route.routeEvidence,now) &&
      !!MODES[route.travelMode] &&
      route.routeEvidence.sourceUrl === ORS_ORIGIN+"/v2/directions/"+MODES[route.travelMode]+"/geojson";
  }
  function routerConfig() {
    const cfg=W.HG_ORS;
    if (!cfg || typeof cfg.apiKey!=="string" || !cfg.apiKey.trim()) return null;
    // No untrusted URL or redirect to an alternate host may receive private points.
    try {
      const url=new URL(cfg.baseUrl||ORS_ORIGIN);
      if (url.origin!==ORS_ORIGIN || url.pathname!=="/" || url.search ||
          url.hash || url.username || url.password) return null;
      return cfg.apiKey;
    } catch (_) {return null;}
  }
  function bad(reason) { return {ok:false,reason}; }
  function readRoute(response,expectedSegments) {
    const segments=response?.features?.[0]?.properties?.segments;
    const geom=response?.features?.[0]?.geometry;
    if (!Array.isArray(segments)||segments.length!==expectedSegments||
        geom?.type!=="LineString"||!Array.isArray(geom.coordinates)||
        geom.coordinates.length<2||geom.coordinates.length>10000||
        !geom.coordinates.every(row=>Array.isArray(row)&&row.length===2&&numeric(row[0],-180,180)&&numeric(row[1],-90,90))) return null;
    let seconds=0,distance=0;
    for(const segment of segments) {
      if (!numeric(segment?.duration,0,86400)||!numeric(segment?.distance,0,10000000)) return null;
      seconds+=segment.duration;distance+=segment.distance;
    }
    return {seconds,distance,firstLegSeconds:segments[0].duration};
  }
  /** @param {any} route @param {any} candidate @param {{ consent?: boolean, now?: Date, departureMinute?: number, signal?: AbortSignal }} [options] */
  async function calculate(route,candidate,options={}) {
    if(options.consent!==true) return bad("CONSENT_REQUIRED");
    const now=atTime(options.now??new Date());
    if(!Number.isFinite(now)) return bad("INVALID_TIME");
    if(!validRoad(route,now)) return bad("VERIFIED_ROUTE_REQUIRED");
    const departureMinute=options.departureMinute;
    if(!Number.isInteger(departureMinute)||departureMinute<0||departureMinute>=1440) return bad("DEPARTURE_TIME_REQUIRED");
    if(!candidate || typeof candidate.restaurantId!=="string" || !candidate.restaurantId.trim() ||
        candidate.routeId!==route.id ||
        candidate.routeGeometryRevision!==route.geometryRevision ||
        !point(candidate) || !numeric(candidate.approxCorridorMeters,0,500)) {
      return bad("MATCHING_RESTAURANT_CANDIDATE_REQUIRED");
    }
    const checked=Date.parse(candidate.menuCheckedAt||"");
    const until=Date.parse(candidate.menuFreshUntil||"");
    if(!/^https:\/\//.test(candidate.menuSourceUrl||"") ||
        !Number.isFinite(checked)||!Number.isFinite(until)||checked>now||until<=now) {
      return bad("FRESH_MENU_REQUIRED");
    }
    const profile=MODES[route.travelMode];
    if(!profile) return bad("UNSUPPORTED_TRAVEL_MODE");
    const apiKey=routerConfig();
    if(!apiKey) return bad("ROUTER_NOT_CONFIGURED");
    const url=ORS_ORIGIN+"/v2/directions/"+profile+"/geojson";
    const coords=(p)=>[p.longitude,p.latitude];
    const start=coords(route.waypoints[0]),end=coords(route.waypoints[1]),stop=coords(candidate);
    async function request(waypoints) {
      const response=await fetch(url,{
        method:"POST",credentials:"omit",redirect:"error",referrerPolicy:"no-referrer",
        headers:{"Authorization":apiKey,"Content-Type":"application/json"},
        body:JSON.stringify({coordinates:waypoints}),signal:options.signal
      });
      if(!response?.ok) throw Error("ORS unavailable");
      return response.json();
    }
    let straight,via;
    try {
      // Same ORS profile and observation session for an apples-to-apples detour.
      straight=readRoute(await request([start,end]),1);
      via=readRoute(await request([start,stop,end]),2);
    } catch (_) {return bad("ROUTING_UNAVAILABLE");}
    if(!straight||!via) return bad("INVALID_ROUTING_RESPONSE");
    const addedSeconds=via.seconds-straight.seconds;
    if(addedSeconds < -30) return bad("INCONSISTENT_ROUTING_RESULTS");
    const passMinutes=Math.round(departureMinute+via.firstLegSeconds/60);
    if(passMinutes>=1440) return bad("CROSS_MIDNIGHT_UNSUPPORTED");
    const detourMinutes=Math.round(Math.max(0,addedSeconds)/6)/10;
    const checkedAt=new Date(now).toISOString();
    return {
      ok:true, status:"verified_detour",
      restaurantId:String(candidate.restaurantId||""),
      routeProof:{
        routeId:route.id,geometryRevision:route.geometryRevision,
        passMinutes,detourMinutes,
        evidence:{sourceUrl:url,checkedAt,validUntil:new Date(now+24*3600*1000).toISOString()}
      },
      baselineMinutes:straight.seconds/60,
      viaStopMinutes:via.seconds/60,
      detourWithinTenMinutes:detourMinutes<=10,
      kitchenOpenAtPassTime:"unknown",
      isActualVisit:false,
      isVerifiedMealOffer:false
    };
  }
  W.CivicationRestaurantDetours=Object.freeze({calculate});
})();