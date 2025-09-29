import os
import csv
import shutil

# Functie om de CSV-data in te lezen
def lees_csv(bestandsnaam):
    data = []
    try:
        with open(bestandsnaam, 'r', newline='', encoding='utf-8') as f:
            lezer = csv.reader(f)
            data = list(lezer)
        return data
    except FileNotFoundError:
        print(f"Fout: '{bestandsnaam}' niet gevonden in de huidige map.")
        return None
    except Exception as e:
        print(f"Fout: Er is een probleem met het lezen van het CSV-bestand. ({e})")
        return None

# Functie om de CSV-data weg te schrijven
def schrijf_csv(bestandsnaam, data):
    try:
        with open(bestandsnaam, 'w', newline='', encoding='utf-8') as f:
            schrijver = csv.writer(f)
            schrijver.writerows(data)
    except Exception as e:
        print(f"Fout: Er is een probleem met het schrijven naar het CSV-bestand. ({e})")

# Hoofdprogramma
if __name__ == "__main__":
    csv_bestandsnaam = 'collection.csv'
    
    # Lees de CSV eenmalig aan het begin
    data = lees_csv(csv_bestandsnaam)
    if data is None:
        exit()
    if not data:
        print("Fout: CSV-bestand is leeg.")
        exit()

    header = data[0]
    items = data[1:]

    # Zoek de indexen van de relevante kolommen
    try:
        what_index = header.index('what')
        year_index = header.index('year')
    except ValueError:
        print("Fout: De 'what' of 'year' kolom ontbreekt in de kopregel.")
        exit()
        
    afbeeldingen_index = -1
    try:
        afbeeldingen_index = header.index('afbeeldingen')
    except ValueError:
        header.append('afbeeldingen')
        afbeeldingen_index = len(header) - 1

    # Maak de hoofdmap voor afbeeldingen
    afbeeldingen_hoofdmap = 'afbeeldingen'
    if not os.path.exists(afbeeldingen_hoofdmap):
        os.makedirs(afbeeldingen_hoofdmap)

    # Deel de beschikbare rijen met de gebruiker
    print("Het CSV-bestand heeft de volgende items:")
    for i, item in enumerate(items):
        try:
            print(f"Rij {i+2}: {item[what_index]} ({item[year_index]})")
        except (IndexError, ValueError):
            continue

    # Begin een eindeloze lus voor het verwerken van de rijen
    while True:
        gekozen_rij_input = input("\nVoer het nummer van de rij in die je wilt verwerken of typ 'lego' om te stoppen: ")
        
        if gekozen_rij_input.lower() == 'lego':
            break

        try:
            rij_nummer = int(gekozen_rij_input.strip())
            index_in_lijst = rij_nummer - 2
        except ValueError:
            print("Ongeldige invoer. Voer een getal in of typ 'lego'.")
            continue
        
        if index_in_lijst < 0 or index_in_lijst >= len(items):
            print(f"Waarschuwing: Rijnummer {rij_nummer} is ongeldig. Probeer het opnieuw.")
            continue
        
        item = items[index_in_lijst]
        
        # We negeren rijen die geen geldige data bevatten in de 'what' en 'year' kolommen
        if not (len(item) > what_index and item[what_index] and item[what_index] != 'what' and len(item) > year_index and item[year_index] and item[year_index] != 'year'):
            print(f"Rij {rij_nummer} overgeslagen: ongeldige data. Probeer een andere rij.")
            continue

        # Maak een unieke mapnaam met de 'what' en 'year' kolommen
        map_naam = f"{item[what_index]}_{item[year_index]}".replace(" ", "_").replace("/", "-").replace("\\", "-")
        item_map_pad = os.path.join(afbeeldingen_hoofdmap, map_naam)
        if not os.path.exists(item_map_pad):
            os.makedirs(item_map_pad)

        print(f"\n--- Verwerking van rij {rij_nummer} ---")
        print(f"** {item[what_index]} ** ({item[year_index]})")
        print(f"Schuif nu alle foto's voor dit model naar de volgende map:")
        print(f"    {item_map_pad}")
        input("Druk op ENTER als je klaar bent met het verplaatsen van de foto's...")

        # Hernoem en verwerk de foto's
        georganiseerde_paden = []
        bestandsnamen = [f for f in os.listdir(item_map_pad) if os.path.isfile(os.path.join(item_map_pad, f))]
        
        for j, bestandsnaam in enumerate(sorted(bestandsnamen)):
            extensie = os.path.splitext(bestandsnaam)[1]
            nieuwe_naam = f"{map_naam}-{j+1}{extensie}"
            oud_pad = os.path.join(item_map_pad, bestandsnaam)
            nieuw_pad = os.path.join(item_map_pad, nieuwe_naam)
            os.rename(oud_pad, nieuw_pad)
            georganiseerde_paden.append(os.path.join(item_map_pad, nieuwe_naam))
    
        # Voeg de paden toe aan de CSV data
        item_paden_string = ",".join(georganiseerde_paden)
        if len(item) > afbeeldingen_index:
            item[afbeeldingen_index] = item_paden_string
        else:
            item.extend([''] * (afbeeldingen_index - len(item) + 1))
            item[afbeeldingen_index] = item_paden_string
    
    # Schrijf de bijgewerkte data terug naar het CSV-bestand
    schrijf_csv(csv_bestandsnaam, data)
    print("\nAlle gekozen items zijn verwerkt! De CSV is bijgewerkt.")