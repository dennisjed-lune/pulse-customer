# Pulse customer journey prototype (Mastercard RFP)

The cardholder wallet inside the bank app: an offers-first home with three tabs (Offers, My offers, Rewards).
Open `index.html` in a browser. The file is self-contained.

## Demo setup (18 Nov 2026)

The demo starts with a setup screen: "Which bank are you pitching?". Only the Lune person sees it.
- Pick a bank, or type a name and website. The logo comes from the website. The colour comes from the logo. A light colour is darkened (same hue) until text and buttons are easy to read.
- The country sets the merchants, the airline and the ride app. The UAE keeps the RFP offer set.
- The currency converts every amount. The rewards programme name and the credit card name replace the defaults.
- "Rewards shown as" sets Cashback or Points. The font changes the wallet font.
- The language setting is English only in this wallet for now.

Each new visit opens the setup screen, filled in with the last bank. To change the bank during a pitch, use "Demo setup" at the bottom left.

My offers shows the offers as a grid, three in each row.

The bank colour shows in the borders of cards and fields. The screen is white. On the Offers screen, Expiring soon and All offers sit on a light bank tint.

All offers includes the link and promo-code offers, each with a badge (Link, Promo code). A filter above the list shows All, Card, Link or Promo code. They show in every programme. In a points programme, the link offer's rate is in points and the promo code stays a discount.

To join, slide the button past halfway, or tap anywhere on the slider.

Transactions: tap the balance at the top of any tab, or Transactions on Rewards. The page has two tabs, Pending and Received. Amounts show as cashback or points, to match the programme, in the bank's currency. To compare looks, add `?look=none`, `?look=border` or `?look=tint` to the link.

This is the pitch version. It does not show the internal RFP review marks. A script at the end of `index.html` (`id="pitch-mode"`) hides them.

## Source
- `src/cext.js`, `src/build_customer.py`: the wallet add-on and its build (13 Nov 2026).
- `src/demo-setup/`: the setup screen (`vendor/setup.js`, `vendor/country.js`, `vendor/fx.js`, from pulse-mobile-demo), the adapter that applies the bank to the wallet (`wb-adapter.js`) and the build (`build_wallet_demo.py`). Run the build from the `product` workspace.
