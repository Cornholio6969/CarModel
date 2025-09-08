class CarBrand {
  constructor(name) {
    this.name = name;
  }
}

class Car {
  constructor(name, year, price, brand) {
    this.name = name;
    this.year = year;
    this.price = price;
    this.brand = new CarBrand(brand);
  }
}

$(document).ready(function () {
  let cars = [];
  let editIndex = null;

  function getDistinctCarBrands() {
    const brands = cars.map(car => car.brand.name);
    return [...new Set(brands)];
  }

  function updateCounters() {
    $('#carCount').text(cars.length);
    $('#carBrandCount').text(getDistinctCarBrands().length);
  }

  function renderTable() {
    $('#carTableBody').empty();

    cars.forEach((car, index) => {
      const row = `
        <tr data-index="${index}">
          <td>${car.name}</td>
          <td>${car.year}</td>
          <td>${car.price} kr</td>
          <td>${car.brand.name}</td>
          <td>
            <button class="btn btn-info btn-sm edit-car">Ret</button>
            <button class="btn btn-danger btn-sm delete-car">Slet</button>
          </td>
        </tr>
      `;
      $('#carTableBody').append(row);
    });

    updateCounters();
  }

  $('#carForm').on('submit', function (e) {
    e.preventDefault();

    const name = $('#carName').val();
    const year = $('#carYear').val();
    const price = $('#carPrice').val();
    const brand = $('#carBrand').val();

    const car = new Car(name, year, price, brand);

    if (editIndex !== null) {
      cars[editIndex] = car;
      editIndex = null;
    } else {
      cars.push(car);
    }

    renderTable();
    this.reset();
  });

  $('#carTableBody').on('click', '.delete-car', function () {
    const index = $(this).closest('tr').data('index');
    cars.splice(index, 1);
    renderTable();
  });

  $('#carTableBody').on('click', '.edit-car', function () {
    const index = $(this).closest('tr').data('index');
    const car = cars[index];

    $('#carName').val(car.name);
    $('#carYear').val(car.year);
    $('#carPrice').val(car.price);
    $('#carBrand').val(car.brand.name);
    editIndex = index;
  });

$('#carPlateModal').on('click', function () {
    Swal.fire({
    title: "Indtast nummerplade på bil",
    input: "text",
    inputAttributes: {
        autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Slå op",
    showLoaderOnConfirm: true,
    preConfirm: async (plate) => {
        try {
          const tjekbilAPI = `https://plate.cornholio.dev/?plate=${plate}`;

          const response = await fetch(tjekbilAPI);
          if (!response.ok) {
            return Swal.showValidationMessage(`
              Nummerplade ikke fundet eller ugyldig.
            `);
          }
          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`
              Request fejlede: ${error}
          `);
        }
    },
    allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value && result.value.basic) {
        const carData = result.value.basic;
        const brand = carData.maerkeTypeNavn || "Ukendt mærke";
        const model = carData.modelTypeNavn || "Ukendt model";
        const year = carData.foersteRegistreringDatoFormateret || "Ukendt år";

        const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
        
        Swal.fire({
          title: `Mærke: ${formattedBrand}<br>Model: ${model}<br>År: ${year}`,
          icon: "info"
        });

        const car = new Car(model, year, 0, formattedBrand);

        if (editIndex !== null) {
          cars[editIndex] = car;
          editIndex = null;
        } else {
          cars.push(car);
        }

        renderTable();
        this.reset();
      }
    });
  });
});
