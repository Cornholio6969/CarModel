using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using App.Infrastructure;
using App.Models;
using App.Views;

namespace App.ViewModels;

public class MainWindowViewModel : INotifyPropertyChanged
{
    public ObservableCollection<Car> Cars { get; } = new();

    private string _carName = "";
    public string CarName { get => _carName; set { _carName = value; OnPropertyChanged(); } }

    private string _carYear = "";
    public string CarYear { get => _carYear; set { _carYear = value; OnPropertyChanged(); } }

    private string _carPrice = "";
    public string CarPrice { get => _carPrice; set { _carPrice = value; OnPropertyChanged(); } }

    private string _carBrand = "";
    public string CarBrand { get => _carBrand; set { _carBrand = value; OnPropertyChanged(); } }

    private int? _editIndex = null;

    public int CarCount => Cars.Count;
    public int CarBrandCount => Cars.Select(c => c.Brand.Name).Distinct(StringComparer.OrdinalIgnoreCase).Count();

    public ICommand AddOrSaveCommand { get; }
    public ICommand ResetCommand { get; }
    public ICommand DeleteCommand { get; }
    public ICommand EditCommand { get; }
    public ICommand LookupPlateCommand { get; }

    private static readonly HttpClient _http = new();

    public MainWindowViewModel()
    {
        AddOrSaveCommand = new RelayCommand(_ => AddOrSave());
        ResetCommand = new RelayCommand(_ => ResetForm());
        DeleteCommand = new RelayCommand(idx => DeleteAt(idx));
        EditCommand = new RelayCommand(idx => BeginEdit(idx));
        LookupPlateCommand = new RelayCommand(async owner => await LookupPlateAsync(owner));
        Cars.CollectionChanged += (_, __) => { OnPropertyChanged(nameof(CarCount)); OnPropertyChanged(nameof(CarBrandCount)); };
    }

    private void AddOrSave()
    {
        if (!decimal.TryParse(CarPrice.Replace(",", "."),
                              System.Globalization.NumberStyles.Any,
                              System.Globalization.CultureInfo.InvariantCulture, out var price))
            price = 0m;

        var car = new Car(CarName, CarYear, price, CarBrand);

        if (_editIndex is int i && i >= 0 && i < Cars.Count)
        {
            Cars[i] = car;
            _editIndex = null;
        }
        else
        {
            Cars.Add(car);
        }
        ResetForm();
    }

    private void ResetForm()
    {
        CarName = CarYear = CarPrice = CarBrand = "";
        _editIndex = null;
    }

    private void DeleteAt(object? param)
    {
        if (param is Car car)
        {
            var i = Cars.IndexOf(car);
            if (i >= 0) Cars.RemoveAt(i);
        }
    }

    private void BeginEdit(object? param)
    {
        if (param is Car car)
        {
            var i = Cars.IndexOf(car);
            if (i < 0) return;
            CarName  = car.Name;
            CarYear  = car.Year;
            CarPrice = car.Price.ToString("0.##");
            CarBrand = car.Brand.Name;
            _editIndex = i;
        }
    }

    private async Task LookupPlateAsync(object? owner)
    {
        var window = owner as Window;

        if (window is null)
        {
            var lifetime = Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime;
            window = lifetime?.MainWindow;
        }

        var plateDialog = new PlateDialog();
        var plate = await plateDialog.ShowDialog<string?>(window!);
        if (string.IsNullOrWhiteSpace(plate)) return;

        try
        {
            var url = $"https://plate.cornholio.dev/?plate={Uri.EscapeDataString(plate.Trim())}";
            using var response = await _http.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                await InfoDialog.Show(window, "Nummerplade ikke fundet eller ugyldig.");
                return;
            }

            using var stream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            if (!doc.RootElement.TryGetProperty("basic", out var basic))
            {
                await InfoDialog.Show(window, "Uventet svar fra API.");
                return;
            }

            string brand = basic.GetPropertyOrDefault("maerkeTypeNavn") ?? "Ukendt mærke";
            string model = basic.GetPropertyOrDefault("modelTypeNavn") ?? "Ukendt model";
            string year  = basic.GetPropertyOrDefault("foersteRegistreringDatoFormateret") ?? "Ukendt år";

            if (!string.IsNullOrEmpty(brand))
                brand = char.ToUpper(brand[0]) + (brand.Length > 1 ? brand[1..].ToLower() : "");

            await InfoDialog.Show(window, $"Mærke: {brand}\nModel: {model}\nÅr: {year}");

            var car = new Car(model, year, 0m, brand);

            if (_editIndex is int i && i >= 0 && i < Cars.Count)
            {
                Cars[i] = car;
                _editIndex = null;
            }
            else
            {
                Cars.Add(car);
            }
            ResetForm();
        }
        catch (Exception ex)
        {
            await InfoDialog.Show(window, $"Request fejlede: {ex.Message}");
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

file static class JsonExt
{
    public static string? GetPropertyOrDefault(this JsonElement el, string name)
        => el.TryGetProperty(name, out var v) ? v.GetString() : null;
}
