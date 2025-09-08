using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;

namespace App.Views;

public partial class PlateDialog : Window
{
    public PlateDialog()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    private void OnOk(object? sender, RoutedEventArgs e)
    {
        Close((this.FindControl<TextBox>("PlateBox")?.Text ?? "").Trim());
    }

    private void OnCancel(object? sender, RoutedEventArgs e)
    {
        Close(null);
    }
}
