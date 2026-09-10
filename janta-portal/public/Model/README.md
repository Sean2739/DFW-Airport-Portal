# 3D Tower Body Tracking

A web-based 3D visualization application that displays a tower model with automatic sun tracking. The tower automatically rotates to face the sun as it orbits around, simulating a solar tracking system.

## Features

- **3D Tower Visualization**: Loads and displays a detailed 3D tower model from GLTF format
- **Animated Sun**: A sun model that orbits around the tower in a circular path
- **Automatic Sun Tracking**: Tower automatically rotates to face the sun
- **Manual Controls**: Use arrow keys to manually rotate the tower
- **Interactive Camera**: Mouse controls for rotating, panning, and zooming the view
- **Realistic Lighting**: Dynamic lighting with shadows and environment reflections
- **Natural Environment**: Ground plane with grass texture and scattered vegetation
- **Sky Background**: Gradient sky that transitions from blue to warm colors

## Requirements

- Python 3.6 or higher (for the HTTP server)
- Modern web browser with WebGL support (Chrome, Firefox, Edge, Safari)
- No additional dependencies needed (Three.js is loaded from CDN)

## Installation

1. Clone or download this repository
2. Ensure all required files are present:
   - `server.py` - Python HTTP server
   - `index.html` - Main HTML file
   - `app.js` - Main application JavaScript
   - `5.6k_10x4_panels.gltf` - Tower 3D model
   - `sun.glb` - Sun 3D model

## Usage

### Starting the Server

1. Open a terminal in the project directory
2. Run the Python server:
   ```bash
   python3 server.py
   ```
   Or on Windows:
   ```bash
   python server.py
   ```

3. The server will start on port 8005. You should see:
   ```
   Server running at http://localhost:8005/
   Press Ctrl+C to stop the server
   ```

### Accessing the Application

1. Open your web browser
2. Navigate to: `http://localhost:8005`
3. Wait for the 3D models to load (you'll see a loading progress indicator)

## Controls

### Keyboard Controls

- **Left Arrow (←)**: Rotate tower counter-clockwise
- **Right Arrow (→)**: Rotate tower clockwise
- **Spacebar**: Toggle automatic sun tracking on/off

### Mouse Controls

- **Left Click + Drag**: Rotate the camera around the scene
- **Right Click + Drag**: Pan the camera
- **Scroll Wheel**: Zoom in and out
- **Middle Click + Drag**: Pan the camera (alternative)

## How It Works

### Automatic Sun Tracking

By default, the tower automatically rotates to face the sun as it orbits around. The sun moves in a circular path at a fixed distance from the tower. The tower calculates the angle to the sun and smoothly rotates to face it.

### Manual Control

When you press the arrow keys, the tower switches to manual control mode. The rotation has momentum - it will gradually slow down when you release the keys. After manual control stops, automatic tracking resumes.

### Technical Details

- **3D Engine**: Three.js (loaded from CDN)
- **Model Format**: GLTF/GLB (glTF 2.0)
- **Rendering**: WebGL with hardware acceleration
- **Shadows**: PCF soft shadows for realistic lighting
- **Environment Mapping**: Dynamic environment maps for reflections

## Project Structure

```
Tower-3DBody-Tracking-/
├── server.py              # Python HTTP server with CORS support
├── index.html             # Main HTML file with UI
├── app.js                 # Main application logic and 3D scene
├── 5.6k_10x4_panels.gltf  # Tower 3D model (GLTF format)
├── sun.glb                # Sun 3D model (GLB format)
├── *.bin                  # Binary data buffers for GLTF model (15 files, all required)
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

### Essential Files

**Core Application Files:**
- `server.py` - Required to run the HTTP server
- `index.html` - Required main HTML page
- `app.js` - Required application JavaScript

**3D Model Files (All Required):**
- `5.6k_10x4_panels.gltf` - Tower model definition
- `sun.glb` - Sun 3D model
- `*.bin` files (15 files) - Binary geometry/texture data referenced by the GLTF file
  - These files are **required** - the GLTF model will not load without them
  - Do not delete or move these files as they are referenced by path in the GLTF file

**Documentation:**
- `README.md` - This documentation file
- `.gitignore` - Git ignore patterns

## File Descriptions

- **server.py**: Simple HTTP server that serves the application files. Includes CORS headers to allow loading resources.

- **index.html**: The main HTML page that contains the UI structure, styling, and loads the JavaScript application.

- **app.js**: The core application file that:
  - Sets up the Three.js scene, camera, and renderer
  - Loads 3D models (tower and sun)
  - Creates the ground plane and vegetation
  - Implements sun orbit animation
  - Handles automatic and manual tower rotation
  - Manages keyboard and mouse controls

## Troubleshooting

### Server Won't Start

- **Port Already in Use**: If port 8005 is already in use, modify the `PORT` variable in `server.py` to use a different port (e.g., 8006, 8080)

### Models Don't Load

- **Check File Paths**: Ensure `5.6k_10x4_panels.gltf` and `sun.glb` are in the same directory as `index.html`
- **Browser Console**: Open browser developer tools (F12) and check the Console tab for error messages
- **CORS Issues**: Make sure you're accessing via the server (http://localhost:8005) and not opening the HTML file directly

### Performance Issues

- **Reduce Vegetation**: In `app.js`, reduce the count parameter in `createBushes(groundPlane, 40)` to a lower number
- **Lower Shadow Quality**: In `app.js`, reduce `sunLight.shadow.mapSize.width` and `height` from 4096 to 2048

### Browser Compatibility

- **WebGL Not Supported**: Update your browser or use a different browser
- **ES6 Modules Not Supported**: Use a modern browser (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)

## Development

### Modifying the Application

- **Change Sun Speed**: Modify `sunOrbitSpeed` in `app.js` (default: 0.005)
- **Change Sun Distance**: Modify `sunOrbitRadius` in `app.js` (default: 120)
- **Adjust Rotation Speed**: Modify `rotationAcceleration` and `rotationDecay` in `app.js`
- **Change Colors**: Modify color values in the scene setup section of `app.js`

### Adding Features

The code is well-commented and organized into sections:
- Scene setup
- Camera and controls
- Lighting
- Model loading
- Animation loop
- Event handlers

Each section is clearly marked with comments, making it easy to understand and modify.

## License

This project is provided as-is for educational and demonstration purposes.

## Credits

- **Three.js**: 3D graphics library (https://threejs.org/)
- **GLTF Format**: 3D model format (https://www.khronos.org/gltf/)

## Notes

- The application uses ES6 modules, so it must be served via HTTP (not opened as a file)
- All 3D models should be in the same directory as the HTML file
- The server includes CORS headers for development; in production, you should restrict origins
