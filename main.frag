#ifdef GL_ES
precision mediump float;
#endif

// Outside variables
uniform float u_time;
uniform vec2 u_resolution;

// Constants
const int octaves = 12;
float maskRadius = 0.2;
float lacunarity = 2.0;
float persistance = 0.5;
float scale = 1.0;

// Time speed
float timeSpeed = 0.15;

// Colors
vec3 COLOR_DEEPWATER = vec3(0.000, 0.243, 0.698);
vec3 COLOR_WATER = vec3(0.030, 0.321, 0.776);
vec3 COLOR_SAND = vec3(0.996, 0.878, 0.701);
vec3 COLOR_GRASS = vec3(0.035, 0.470, 0.364);
vec3 COLOR_DARKGRASS = vec3(0.039, 0.419, 0.282);
vec3 COLOR_DARKESTGRASS = vec3(0.043, 0.368, 0.200);
vec3 COLOR_DARKROCKS = vec3(0.549, 0.556, 0.482);
vec3 COLOR_ROCKS = vec3(0.627, 0.635, 0.560);
vec3 COLOR_SNOW = vec3(1.000, 1.000, 1.000);

// Simplex noise algorithm
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C 
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Color pallete
vec3 pallete(float val) {
    if (val <= 0.329) return COLOR_DEEPWATER;
    if (val <= 0.400) return COLOR_WATER;
    if (val <= 0.439) return COLOR_SAND;
    if (val <= 0.525) return COLOR_GRASS;
    if (val <= 0.643) return COLOR_DARKGRASS;
    if (val <= 0.784) return COLOR_DARKESTGRASS;
    if (val <= 0.878) return COLOR_DARKROCKS;
    if (val <= 0.949) return COLOR_ROCKS;
    
    return COLOR_SNOW;
}

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    
    float amplitude = 1.0;
    float frequency = 1.0;
    float noiseHeight = 0.0;
    
    // Calculate height for each octave
    for (int octave = 0; octave < octaves; octave++) { 
        float simplexValue = snoise(vec3(uv  / scale * frequency, u_time * timeSpeed));
        noiseHeight += simplexValue * amplitude;
        amplitude *= persistance;
        frequency *= lacunarity;
    }
    
    // Apply circular mask
    noiseHeight *= max(0.0, min(1.0, 1.0 - pow(length(uv) - maskRadius, 2.0)));
    
    // Apply pallete color
    vec3 finalColor = pallete(noiseHeight);
    
    // Output to screen
    gl_FragColor = vec4(finalColor, 1.0);
}