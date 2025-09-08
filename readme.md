# Corny – OOP Cars

This project demonstrates **object-oriented programming (OOP)** with cars and brands, implemented in three different environments:

- **Avalonia (.NET, C#)** – a modern cross-platform desktop GUI  
- **TypeScript** – using modern browser APIs  
- **JavaScript (jQuery)** – classic web development style  

---

## Concept

The core of the project is two classes:

```csharp
class CarBrand {
    public string Name { get; set; }
    public CarBrand(string name) => Name = name;
}

class Car {
    public string Name { get; set; }
    public string Year { get; set; }
    public decimal Price { get; set; }
    public CarBrand Brand { get; set; }

    public Car(string name, string year, decimal price, string brand) {
        Name = name;
        Year = year;
        Price = price;
        Brand = new CarBrand(brand);
    }
}
```
---

## API

The project integrates with:
```
https://plate.cornholio.dev/?plate=...
```

This API is **powered by Cloudflare Workers**, making it lightweight and serverless.  
It allows users to fetch car details (brand, model, year) directly from a license plate lookup.  
