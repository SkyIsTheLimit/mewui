# MewUI

A miniature UI development library to quickly prototype small websites.

## Installation

```shell
npm install mewui
```

### OR

```shell
yarn add mewui
```

## Usage

MewUI is used to quickly make your DOM reactive.

```typescript
import { Mew } from 'mewui';

interface CurrentTimeModel {
  currentTime: string;
}

// Create the view model.
const vm = new Mew<CurrentTimeModel>(`
  <div class="clock">
    <p>The current time is :currentTime</p>
  </div>
`).apply({
  currentTime: 'Current Time Loading . . .',
});

// Append the template to the DOM.
vm.el().appendTo(document.body);

setInterval(() => {
  // Update the values on the view model and see it update on the DOM automatically.
  vm.currentTime = new Date().toLocaleTimeString();
}, 10);
```
