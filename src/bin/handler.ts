import { h, jsx, serve } from "https://deno.land/x/sift@0.4.3/mod.ts";

const App = (title = 'Hello World!') => h(
  'div', {}, [
    h('h1',{}, [
      title
    ])
  ]
);

const NotFound = () => h(
  'div',{},[
    h('h1', {},[ 'Page not found'])
  ]
);

serve({
  "/": () => jsx(App()), // Home Page?
  "/create": () => jsx(App('Create')), // User Auth
  "/signin": () => jsx(App('SignIn')), // User Auth
  "/logout": () => jsx(App('Logout')), // User Auth
  "/new": () => jsx(App('New')), // Spit out a new token - 
  "/t:token": () => jsx(App('Token Available Compositions')), // List Recpies availabel for the Token ?
  "/u:user": () => jsx(App('User Available Compositions')), // List Recpies availabel for the Token ?
  "/{u|t}:token/:outputFmt/:composition": () => jsx(App()), // Configure + Confirm Composition
  "/:token/:outputFmt/:composition/preview/:url": () => jsx(App()), // Visualize the result of the composition
  "/:token/:outputFmt/:composition/:url": () => jsx(App()), // Proxy URL
  404: () => jsx(NotFound(), { status: 404 }),
});


// Token Types
// temporary
// user account: Basic 
// user account: Advanced 
// user account: Pro


// # Temporary Token
// One Composition Per Token
// 60 days or 1k posts items/entries clean for free
// Access To Public feedSalon
// 
// # User Accounts: 
// 
// ## Free
// 1k posts cleaned free per month
// Access To Paid + Public feedSalon
// Access to `Feed Composer`
// Barter Composition Credits 
//
//
// ## Advanced:
// Credit Card on file
// 10k posts cleaned per month
// Access To Paid + Public feedSalon
// Access to `Feed Composer`
// Composition Credits 1st covers your your bill and then accumulate as Bankable Credit
// 
//
// ## Pro:
// Credit Card on file
// 20k posts cleaned per month
// Access To Paid + Public feedSalon
// Access to `Feed Composer`
// All Credits are Bankable Credit
// 