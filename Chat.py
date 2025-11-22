import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# --- Constantes físicas ---
G = 6.67408e-11  # Constante gravitacional
M_TERRA = 5.972e24  # masa de la Tierra
R_TERRA = 6.371e6  # radio de la Tierra (m)

# --- Datos del asteroide ---
pos = np.array([8e6, 0.0])  # posición inicial (m) — 8,000 km del centro
vel = np.array([0.0, 7500.0])  # velocidad tangencial (m/s)

dt = 1  # paso de tiempo (s)
steps = 5000

# Para guardar trayectoria
xs, ys = [], []

def gravedad(pos):
    dist = np.linalg.norm(pos)
    return -(G * M_TERRA / dist**3) * pos

def update():
    global pos, vel
    acc = gravedad(pos)
    vel = vel + acc * dt
    pos = pos + vel * dt
    return pos

def impacta_tierra(pos):
    return np.linalg.norm(pos) <= R_TERRA

# --- Simulación ---
for _ in range(steps):
    if impacta_tierra(pos):
        print("💥 ¡Impacto con la Tierra!")
        break
    p = update()
    xs.append(p[0])
    ys.append(p[1])

# --- Gráfica estática ---
plt.figure(figsize=(6,6))
# Tierra
earth = plt.Circle((0,0), R_TERRA, fill=True)
plt.gca().add_patch(earth)

plt.plot(xs, ys)
plt.xlabel("X (m)")
plt.ylabel("Y (m)")
plt.title("Simulación 2D de órbita del asteroide")
plt.axis("equal")
plt.grid(True)
plt.show()
