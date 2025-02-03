# Retail Cart Application (Angular 18)

## Overview
This is a simple single-page application (SPA) built with Angular 18 that simulates a retail shopping cart. Users can:
- View a list of products.
- Add products to the cart.
- Manage cart items (update quantity, remove items).
- Apply discount codes to the total.
- Retain cart values after a page refresh.

## Features
### 1. Product List
- Displays a list of at least four products.
- Each product includes a name, price, and optional image.
- Users can add products to the cart.

### 2. Cart Functionality
- Users can:
  - Add products to the cart.
  - View product details, quantity, and price.
  - Update product quantity using an input field.
  - Remove items from the cart.
  - View subtotal for each item and the grand total.

### 3. Discount Code
- Users can enter a discount code in the cart.
- Valid discount codes:
  - `SAVE10` → 10% off the grand total.
  - `SAVE5` → $5 off the grand total.
- If an invalid code is entered, an error message is displayed.

### 4. Cart Persistence
- Cart values are stored in local storage to retain data after page refresh.

### 5. Responsive UI
- Simple and clear UI for easy navigation.
- Minimalistic design using Angular and CSS.

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [Angular CLI](https://angular.io/cli)

### Clone the Repository
```sh
git clone https://github.com/agbolaayo/retail-cart.git
cd retail-cart
```

### Install Dependencies
```sh
npm install
```

### Run the Application
```sh
ng serve
```
- Open `http://localhost:4200/` in your browser.

### Build for Production
```sh
ng build --prod
```


## Testing
Run unit tests using:
```sh
ng test
```
