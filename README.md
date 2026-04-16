# OS Page Replacement Algorithm Simulator

A beautiful, interactive web application that visualizes page replacement algorithms used in operating systems.

## Features

- Visualize 4 different page replacement algorithms:
  - FIFO (First In First Out)
  - LRU (Least Recently Used)
  - Optimal (OPT)
  - MRU (Most Recently Used)
- Interactive UI with animated visualizations
- Educational content about each algorithm
- Ability to control simulation speed
- Statistics tracking (page faults, hit rate)

## Screenshots

The application provides a modern UI with an interactive visualization of page replacement algorithms.
<img width="939" height="440" alt="image" src="https://github.com/user-attachments/assets/2f8a179a-9679-46cc-b812-96acc314a2d9" />
<img width="923" height="436" alt="image" src="https://github.com/user-attachments/assets/18048f0c-0f9c-4504-aec6-aed8564f7be2" />
<img width="845" height="439" alt="image" src="https://github.com/user-attachments/assets/9b72a0ec-0def-419f-a7e5-ffd97aae43ea" />
<img width="817" height="432" alt="image" src="https://github.com/user-attachments/assets/9201bd37-a273-48d4-bcad-c6fb591bf2c0" />
<img width="833" height="377" alt="image" src="https://github.com/user-attachments/assets/266509ea-575b-4de4-898e-4a20671269c7" />





## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed on your computer
2. Clone this repository or download the files
3. Open a terminal/command prompt in the project directory
4. Install dependencies:

```bash
npm install
```

## Usage

1. Start the server:

```bash
npm start
```

2. Open your web browser and go to http://localhost:3000
3. Enter a reference string (sequence of page numbers separated by spaces)
4. Set the number of frames
5. Select an algorithm
6. Click "Run Simulation" to start the visualization
7. Use the Pause/Resume button to control the simulation flow
8. Use the Reset button to start over

## Technical Details

This project is built with:
- HTML5, CSS3, and JavaScript for the frontend
- Node.js and Express for the backend
- Animations using CSS3 keyframes
- Responsive design for various screen sizes

## Original Source

This web application is based on a Python/Tkinter program that simulates page replacement algorithms. 
