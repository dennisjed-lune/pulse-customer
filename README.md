# Pulse customer journey prototype (Mastercard RFP)

The cardholder wallet inside the bank app: an offers-first home with three tabs (Offers, My offers, Rewards).
It is built on top of the Lune demo environment (`customer` app). The bank colour is a token that you can switch.
Open `index.html` in a browser. The file is self-contained.

This is the pitch version. It does not show the internal RFP review marks (answer labels, legends, row tooltips). A small script at the end of `index.html` (`id="pitch-mode"`) hides them. The internal review version stays in the `product` workspace.

## Source
- `src/cext.js`: the add-on that draws the wallet screens.
- `src/build_customer.py`: patches the demo base with the add-on and writes the built file. Run it from the `product` workspace, because the demo base is there.

Built from the 13 Nov 2026 version.
