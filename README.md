# shitpost.js
The worst frontend web framework. It's slow and shit.

## Features
* 100% written in Vanilla JS (you can copy/paste the JS files without compiling and they'll work in your browser)
* Mediocre optimization (changing the child element only updates itself by using DOM replace)
* SPA routing (currently only exact strings are supported as routes, but if anyone actually wants to use this shit, i'm willing to add support for proper routing)
* Event handling
* State managment (kinda)
* Written in 4 hours


## Hello World Example

```js
$render('.root', $content('Hello, World!'))
```

(or more realistically)

```js
const hello = () => $content(
    $element(
        $tag('h1'),
        $style('color', 'red'),
        $content('Hello, World!')
    )
)

$render('.root', hello())
```

For a better example (with routing) check [`index.js`](index.js)
