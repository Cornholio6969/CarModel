using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using System.Threading.Tasks;

namespace App.Views;

public partial class InfoDialog : Window
{
    public InfoDialog()
    {
        InitializeComponent();
    }

    // Add this
    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public static async Task Show(Window? owner, string message)
    {
        var dlg = new InfoDialog();
        dlg.FindControl<TextBlock>("InfoText")!.Text = message;

        var lifetime = Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime;
        var fallbackOwner = lifetime?.MainWindow;

        if (owner is null)
            await dlg.ShowDialog(fallbackOwner!);
        else
            await dlg.ShowDialog(owner);
    }

    private void OnOk(object? s, RoutedEventArgs e) => Close();
}
