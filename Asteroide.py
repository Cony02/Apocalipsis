import requests
import pandas as pd
import json

def buscar_top_10_amenazas():
    # URL de la herramienta de consulta de JPL (NASA) [cite: 29, 30]
    url = "https://ssd-api.jpl.nasa.gov/sbdb_query.api"

    print("📡 Conectando con la Base de Datos Maestra de NASA/JPL...")
    print("⏳ Descargando todos los NEOs conocidos (esto puede tardar unos segundos)...")

    # Solicitamos TODOS los NEOs (limit seteado a 50k para cubrir el catálogo actual de ~34k)
    params = {
        "sb-group": "neo",
        "fields": "full_name,a,e,i,om,w,ma,moid,diameter,epoch",
        "limit": "50000" 
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print(f"Error conectando a NASA: {response.status_code}")
        return None

    data = response.json()
    print(f"✅ Datos recibidos. Total de objetos crudos: {data['count']}")

    # 1. Crear DataFrame
    cols = ["Nombre", "Semieje_a", "Excentricidad_e", "Inclinacion_i", 
            "Nodo_Asc_om", "Arg_Perihelio_w", "Anomalia_Med_ma", 
            "MOID", "Diametro", "Epoca"]
    df = pd.DataFrame(data['data'], columns=cols)

    # 2. Limpieza de Datos (Data Cleaning)
    # Convertimos columnas críticas a números
    df["MOID"] = pd.to_numeric(df["MOID"], errors='coerce')
    df["Diametro"] = pd.to_numeric(df["Diametro"], errors='coerce')

    # IMPORTANTE: Para cumplir el reto, necesitamos saber el tamaño.
    # Muchos asteroides pequeños no tienen diámetro confirmado. Los descartamos.
    df_clean = df.dropna(subset=["MOID", "Diametro"])
    print(f"🔍 Analizando {len(df_clean)} asteroides que tienen datos completos (Distancia y Tamaño)...")

    # ---------------- LÓGICA DEL RETO  ----------------
    
    # PASO A: Identificar el "10% que más cerca tiene algún punto de su órbita"
    # Ordenamos por MOID (Distancia mínima de intersección orbital) de menor a mayor
    df_sorted_by_dist = df_clean.sort_values(by="MOID", ascending=True)

    # Calculamos cuántos entran en el 10%
    cutoff_index = int(len(df_sorted_by_dist) * 0.10)
    top_10_percent_closest = df_sorted_by_dist.iloc[:cutoff_index]

    print(f"📉 El 10% más cercano son los {cutoff_index} asteroides con menor MOID.")

    # PASO B: "Debe ser el más grande del 10%..."
    # Ordenamos ese grupo de peligro por DIÁMETRO (Descendente)
    ranking_final = top_10_percent_closest.sort_values(by="Diametro", ascending=False)

    # Seleccionamos los 10 mejores candidatos
    top_10_candidates = ranking_final.head(10).reset_index(drop=True)

    return top_10_candidates

# Ejecutar análisis
top_candidatos = buscar_top_10_amenazas()

if top_candidatos is not None:
    print("\n☄️ TOP 10 CANDIDATOS PARA EL APOCALIPSIS ☄️")
    print("Criterio: Los más grandes dentro del 10% más cercano a la Tierra.\n")
    
    # Mostramos columnas relevantes para elegir
    display_cols = ["Nombre", "Diametro", "MOID", "Semieje_a", "Excentricidad_e"]
    print(top_candidatos[display_cols].to_string(index=True))
    
    # Guardamos el #1 (Ganador) en un JSON separado para la Web App
    ganador = top_candidatos.iloc[0]
    ganador.to_json("asteroide_ganador.json")
    print("\n✅ El candidato #1 ha sido guardado en 'asteroide_ganador.json'")