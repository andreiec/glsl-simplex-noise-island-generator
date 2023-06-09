# GLSL Simplex Noise Island Generation Algorithm

The code for this algorithm is an improved version of the first Island Generation Algorithm that I wrote in [Python](https://github.com/andreiec/opensimplex-island-generator). It is written in the WebGL OpenGL language made primarly for GPU usage, greatly increasing the generation speed (from ~2 mins per generation to steady 144 frames (generations) per second).

## Preview 

<p align="center">
<img src="./preview/shader.gif" alt="image not found" width="600">
</p>

## How does it generate land
1. Creates a matrix of the specified size
2. For each position in the matrix call the noise function to get a value
3. The noise function parameters are modified according to custom variables (frequency and octaves)
4. To create the island effect, it applies a mask to reduce values near the edge
5. Finally, each variable is mapped according to a color table and saved as an image

## Customisation
- `WIDTH` and `HEIGTH` of the map
- `OCTAVES` represents the 'quality' of the map (the higher the octaves the more detailed the map will be)
- `PERSISTANCE` and `LACUNARITY` are used to calculate the frequency and the edginess of the map
- `BIAS` is applied to the mask (a higher bias will result in a smaller island)
- `SEED` is usually random but can be custom
