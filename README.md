# Misión Apocalipsis - Sistema de Defensa Planetaria

## Descripción
Sistema de simulación web para desviar asteroides potencialmente peligrosos usando impacto cinético. Desarrollado para el Hackathon Apocalipsis.

## Objetivo Cumplido
Identificar y visualizar el asteroide más peligroso según criterios NASA: **"El más grande del 10% con órbita más cercana a la Tierra"**

### Asteroide Seleccionado: 109P/Swift-Tuttle
- **Diámetro**: 26 km
- **MOID**: 0.000892 AU
- **Criterio**: Mayor diámetro dentro del 10% con menor distancia de intersección orbital

## Instalación

```bash
# Clonar repositorio
git clone [url-del-repo]

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Build para producción
npm run build

# 🔭 Justificación Científica: Simulación de Desvío del Asteroide 4179 Toutatis

**Equipo:** Cosmo Coders (Equipo 5)  
**Proyecto:** Misión Apocalipsis - Sistema de Defensa Planetaria

Este documento detalla los principios físicos, las ecuaciones matemáticas y las decisiones de escalado visual utilizadas para simular la intercepción y desvío del asteroide potencialmente peligroso (PHA) 4179 Toutatis.

---

## 1. Principio Físico Fundamental: Conservación del Momento

El método de defensa simulado es una **intercepción cinética de alta energía**, técnicamente conocida como *ablación nuclear standoff*. El principio rector es la Tercera Ley de Newton y la Conservación del Momento Lineal.

Al detonar una carga cerca de la superficie del asteroide, se vaporiza material que es expulsado violentamente, generando un empuje tipo cohete que altera la velocidad del cuerpo celeste ($\Delta v$).

### Ecuación de Momento
$$\vec{P}_{final} = \vec{P}_{inicial} + \vec{J}$$

Donde:
* $\vec{P}$: Momento lineal ($Masa \times Velocidad$).
* $\vec{J}$: Impulso aplicado por la detonación.

### Cambio de Velocidad Resultante ($\Delta v$)
La magnitud del cambio de velocidad se calcula mediante:

$$\Delta v = \frac{\beta E}{M c}$$

Donde:
* **$M$**: Masa del asteroide Toutatis ($\approx 5.0 \times 10^{13}$ kg).
* **$E$**: Energía del impacto/detonación (en Joules).
* **$\beta$**: **Factor de mejora de momento**.
  * En un choque inelástico simple, $\beta=1$.
  * En una explosión nuclear donde la superficie se vaporiza actuando como propulsor, $\beta$ puede ser $> 2$, aumentando significativamente la eficiencia.

---

## 2. Mecánica Orbital: Ecuaciones Variacionales de Gauss

Para justificar el cambio de trayectoria (la transición de la línea roja a la verde en la simulación), utilizamos astrodinámica perturbacional. No movemos el asteroide de posición instantáneamente; cambiamos su **vector de velocidad**, lo que obliga a la naturaleza a recalcular su elipse orbital.

Utilizamos las **Ecuaciones de Gauss** para describir cómo una fuerza externa altera los elementos orbitales. En esta simulación, modificamos principalmente la **Inclinación ($i$)** y la **Longitud del Nodo Ascendente ($\Omega$)**.

### Cambio de Inclinación ($i$)
Para evitar el impacto con la Tierra, la estrategia más eficiente suele ser "empujar" el asteroide fuera del plano eclíptico (hacia "arriba" o "abajo" de la Tierra), en lugar de intentar frenarlo.

La ecuación que rige este cambio es:

$$\frac{di}{dt} = \frac{r \cos(\theta + \omega)}{h} a_n$$

Donde:
* **$\Delta i$**: Cambio en la inclinación (separación vertical visible en la simulación).
* **$r$**: Distancia al Sol en el momento del impacto.
* **$h$**: Momento angular específico (constante de la órbita).
* **$a_n$**: Aceleración aplicada en dirección **Normal** (perpendicular al plano orbital).

**Interpretación en la Simulación:**
El impacto del misil aplica una fuerza $a_n$ masiva instantánea. Según la ecuación, esto resulta en un $\Delta i$ inmediato, representado en el código al sumar grados a la variable `Inclinacion_i`.

---

## 3. Trayectoria de Seguridad (La "Línea Verde")

Matemáticamente, una órbita está definida por 6 parámetros (Elementos Keplerianos). Al alterar el vector velocidad $\vec{v}$ en un solo punto, la geometría de toda la elipse cambia.

### Comparativa de Órbitas

| Parámetro | Órbita de Colisión (Roja) | Órbita Segura (Verde) | Efecto |
| :--- | :--- | :--- | :--- |
| **Inclinación ($i$)** | $0.45^\circ$ | $8.45^\circ$ | El asteroide pasa "por encima" de la Tierra. |
| **Riesgo** | Alto (Plano coincidente) | Nulo (Separación vertical) | Evasión exitosa. |



### Cálculo de Seguridad (Miss Distance)
La seguridad se garantiza asegurando que la distancia mínima de intersección de la órbita (MOID) aumente.

$$D_{miss} \approx |\vec{r}_{Tierra} - \vec{r}_{Asteroide}|$$

Al alterar la inclinación, aseguramos que cuando el asteroide cruce la distancia de 1 UA (distancia Tierra-Sol), su altura $Z$ sea distinta de cero:

$$Z_{Asteroide} = r \sin(\Delta i) \sin(\theta + \omega)$$

Si $\Delta i$ es suficiente, entonces $Z_{Asteroide} > (Radio_{Tierra} + Radio_{Atmosfera})$, garantizando que no haya colisión.

---

## 4. Nota Técnica: Escala Real vs. Visualización

> **AVISO DE ESCALA VISUAL**

Para fines de demostración y experiencia de usuario (UX), la simulación emplea un **Factor de Escalado Visual**.

* **En la Realidad Física:** Una detonación de 50 Megatones produciría un $\Delta v$ de apenas unos centímetros por segundo. Esto cambiaría la inclinación en una fracción minúscula de grado ($0.0001^\circ$). Aunque suficiente para evitar el impacto si se realiza con años de antelación, este cambio sería invisible al ojo humano en una pantalla que muestra millones de kilómetros.
* **En la Simulación:** Hemos aplicado un cambio de **$8^\circ$** en la inclinación y un empuje visual al semieje mayor.

**Justificación:** Se aplica una exageración visual (*Visual Scaling Factor $\approx 1000x$*) para que el cambio de órbita y el éxito de la misión sean perceptibles e intuitivos para el usuario en la interfaz 3D.