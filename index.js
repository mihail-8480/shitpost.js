const index = () => $element(
    $route('/'),
    $tag('main'),
    $content('Hello, World!'),
    $style('color', 'red'),
    $on('click', function() {
        const value = this.getKey('bool')
        this.setKey('bool', !value)
        this.set($style('color',value ? 'red' : 'blue'));
    })
)

const notFound = () => $element(
    $noRoute(),
    $tag('main'),
    $content(
        $element(
            $content('Not found'),
            $tag('h1')
        ),
        $element(
            $content(
                'Click ',
                $element(
                    $content('here'),
                    $attribute('href', 'javascript:void(0)'),
                    $on('click', () => $navigate('/')),
                    $tag('a')
                ),
                ' to go back to the main page.'
            ),
            $tag('p')
        )
    )
)

const app = () => $content(
    $router(
        index(),
        notFound()
    )
)

$render('.root', app())
