"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import styles from "./cars.module.css";

class CarBrand {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Car {
  name: string;
  year: number | string;
  price: number;
  brand: CarBrand;
  constructor(name: string, year: number | string, price: number, brand: string) {
    this.name = name;
    this.year = year;
    this.price = Number(price) || 0;
    this.brand = new CarBrand(brand);
  }
}

export default function CarsPage() {
  // form state
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");

  // data state
  const [cars, setCars] = useState<Car[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // counters
  const carCount = cars.length;
  const carBrandCount = useMemo(() => {
    const brands = cars.map((c) => c.brand.name.trim().toLowerCase());
    return new Set(brands).size;
  }, [cars]);

  function resetForm() {
    setBrand("");
    setName("");
    setYear("");
    setPrice("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand || !name || year === "" || price === "") return;

    const car = new Car(name.trim(), Number(year), Number(price), brand.trim());

    setCars((prev) => {
      const next = [...prev];
      if (editIndex !== null) {
        next[editIndex] = car;
      } else {
        next.push(car);
      }
      return next;
    });
    setEditIndex(null);
    resetForm();
  }

  function handleReset() {
    setEditIndex(null);
    resetForm();
  }

  function handleDelete(index: number) {
    setCars((prev) => prev.filter((_, i) => i !== index));
  }

  function handleEdit(index: number) {
    const car = cars[index];
    setName(car.name);
    setYear(typeof car.year === "number" ? car.year : Number(parseYear(car.year)));
    setPrice(car.price);
    setBrand(car.brand.name);
    setEditIndex(index);
  }

  function parseYear(input: string) {
    // Extract a 4-digit year from strings like "01-04-2019" or "2019-04-01"
    const match = input?.toString().match(/\b(19|20)\d{2}\b/);
    return match ? Number(match[0]) : "";
  }

  async function handlePlateLookup() {
    const result = await Swal.fire({
      title: "Indtast nummerplade på bil",
      input: "text",
      inputAttributes: { autocapitalize: "off" },
      showCancelButton: true,
      confirmButtonText: "Slå op",
      showLoaderOnConfirm: true,
      preConfirm: async (plate) => {
        try {
          const url = `https://plate.cornholio.dev/?plate=${encodeURIComponent(plate)}`;
          const res = await fetch(url);
          if (!res.ok) {
            return Swal.showValidationMessage("Nummerplade ikke fundet eller ugyldig.");
          }
          return res.json();
        } catch (err: any) {
          return Swal.showValidationMessage(`Request fejlede: ${err?.message ?? err}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value?.basic) {
      const basic = result.value.basic;
      const brandRaw = basic.maerkeTypeNavn || "Ukendt mærke";
      const model = basic.modelTypeNavn || "Ukendt model";
      const yearStr = basic.foersteRegistreringDatoFormateret || "Ukendt år";

      const formattedBrand =
        brandRaw ? brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase() : "Ukendt mærke";

      await Swal.fire({
        title: `Mærke: ${formattedBrand}<br>Model: ${model}<br>År: ${yearStr}`,
        icon: "info",
      });

      const parsedYear = typeof yearStr === "string" ? parseYear(yearStr) : yearStr;

      const car = new Car(model, parsedYear || 0, 0, formattedBrand);

      setCars((prev) => {
        const next = [...prev];
        if (editIndex !== null) {
          next[editIndex] = car;
        } else {
          next.push(car);
        }
        return next;
      });

      setEditIndex(null);
      resetForm();
    }
  }

  return (
    <div className="container" style={{ maxWidth: 960, padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Corny</h1>
      <p>Creating car and CarBrand objects from a car and a CarBrand class</p>

      <form id="carForm" onSubmit={handleSubmit} onReset={handleReset} style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <label htmlFor="carBrand">Bil brand</label>
          <input
            id="carBrand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="carName">Bil Model</label>
          <input
            id="carName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="carYear">Bil Årgang</label>
          <input
            id="carYear"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label htmlFor="carPrice">Bil Pris</label>
          <input
            id="carPrice"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            required
          />
        </div>

        <button type="submit">{editIndex !== null ? "Opdater bil" : "Tilføj bil"}</button>
        <button type="reset" style={{ marginLeft: 8 }}>Nulstil</button>
        <span style={{ margin: "0 8px" }}>|</span>
        <button id="carPlateModal" type="button" onClick={handlePlateLookup}>Hent fra nummerplade</button>
      </form>

      <table id="carTable">
        <thead>
          <tr>
            <th>Bil Brand</th>
            <th>Bil Model</th>
            <th>Bil Årgang</th>
            <th>Bil Pris</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody id="carTableBody">
          {cars.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", opacity: 0.7 }}>Ingen biler tilføjet endnu.</td>
            </tr>
          ) : (
            cars.map((c, i) => (
              <tr key={`${c.brand.name}-${c.name}-${i}`}>
                <td>{c.brand.name}</td>
                <td>{c.name}</td>
                <td>{typeof c.year === "number" ? c.year : c.year}</td>
                <td>{(c.price || 0).toLocaleString("da-DK")} kr</td>
                <td className={`${styles.actionsCell} actionsCell`}>
                  <button onClick={() => handleEdit(i)} className={styles.btnInfo}>Ret</button>
                  <button onClick={() => handleDelete(i)} className={styles.btnDanger}>Slet</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p style={{ marginTop: 16, fontWeight: 600 }}>Tekniske Detaljier</p>
      <p>
        Antal Bil objekter defineret: <span id="carCount" style={{ fontWeight: 600 }}>{carCount}</span>
      </p>
      <p>
        Antal Bil brand objekter defineret: <span id="carBrandCount" style={{ fontWeight: 600 }}>{carBrandCount}</span>
      </p>
    </div>
  );
}