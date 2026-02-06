// ==========================================
// Anne-Kat. Hærland – stilisert standup-figur
// Printklar miniatyr (ca. 75 mm)
// ==========================================

$fn = 64;

// --------------------
// Skala
// --------------------
total_height = 75;

// --------------------
// Base
// --------------------
module base(){
    cylinder(h=4, r=18);
}

// --------------------
// Kropp
// --------------------
module torso(){
    translate([0,0,18])
        scale([1,0.7,1.4])
            sphere(r=12);
}

// --------------------
// Hode
// --------------------
module head(){
    translate([0,0,40])
        sphere(r=13);
}

// --------------------
// Briller
// --------------------
module glasses(){
    translate([-6,9,42])
        cube([5,1.5,3]);
    translate([1,9,42])
        cube([5,1.5,3]);
    translate([-1,9,43])
        cube([2,1,1]);
}

// --------------------
// Armer
// --------------------
module arm_left(){
    translate([-10,0,30])
        rotate([0,0,20])
            cylinder(h=22, r=2.2);
}

module arm_right(){
    translate([10,0,30])
        rotate([0,0,-40])
            cylinder(h=22, r=2.2);
}

// --------------------
// Mikrofon
// --------------------
module microphone(){
    translate([18,-4,48])
        rotate([90,0,0])
            cylinder(h=10, r=2);
    translate([18,-4,58])
        sphere(r=3);
}

// --------------------
// Ben
// --------------------
module legs(){
    translate([-4,0,8])
        cylinder(h=12, r=3);
    translate([4,0,8])
        cylinder(h=12, r=3);
}

// --------------------
// Samlet figur
// --------------------
module figur(){
    base();
    legs();
    torso();
    head();
    glasses();
    arm_left();
    arm_right();
    microphone();
}

// --------------------
figur();
