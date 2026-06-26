(function(){
  'use strict';
  const root=typeof window!=='undefined'?window:globalThis;
  const objectives=root.HG_DailyObjectives;
  if(!objectives||objectives._runtimeGuardApplied)return;

  let insideDailyObjectives=0;
  function skippedRuntimeHealth(){
    return {
      ok:true,
      score:null,
      checks:{},
      blockers:[],
      warnings:[{key:'runtime_health_suppressed_for_daily_objectives',message:'RuntimeHealth is skipped while DailyObjectives is building agenda state to avoid recursive health calls.'}],
      summary:'RuntimeHealth skipped during DailyObjectives agenda evaluation.',
      timestamp:new Date().toISOString()
    };
  }

  const runtime=root.HG_RuntimeHealth;
  if(runtime&&typeof runtime.health==='function'&&!runtime._dailyObjectivesRuntimeGuardApplied){
    const originalHealth=runtime.health.bind(runtime);
    runtime.health=function guardedRuntimeHealth(){
      if(insideDailyObjectives>0)return skippedRuntimeHealth();
      return originalHealth();
    };
    runtime._dailyObjectivesRuntimeGuardApplied=true;
  }

  function wrap(name){
    const original=objectives[name];
    if(typeof original!=='function'||original._dailyObjectivesRuntimeGuardWrapped)return;
    function guardedDailyObjectivesMethod(){
      insideDailyObjectives+=1;
      try{return original.apply(objectives,arguments);}finally{insideDailyObjectives=Math.max(0,insideDailyObjectives-1);}
    }
    guardedDailyObjectivesMethod._dailyObjectivesRuntimeGuardWrapped=true;
    objectives[name]=guardedDailyObjectivesMethod;
  }

  ['generate','getAgenda','getSummary','health','refreshStatus','completeObjectiveFromSignals','saveAgenda','getObjectiveStatus','pinObjective','dismissObjective','restoreObjective'].forEach(wrap);
  objectives._runtimeGuardApplied=true;
}());
