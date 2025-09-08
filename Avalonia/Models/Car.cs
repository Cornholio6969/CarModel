namespace App.Models;

public class Car
{
    public string Name { get; set; }
    public string Year { get; set; }
    public decimal Price { get; set; }
    public CarBrand Brand { get; set; }

    public Car(string name, string year, decimal price, string brand)
    {
        Name = name;
        Year = year;
        Price = price;
        Brand = new CarBrand(brand);
    }
}
