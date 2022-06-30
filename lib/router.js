const routers = []

function $router() {
    const routes = arguments
    const element = $element(function() {
        $handle(this).effect(function() {
            const content = []
            const noRoutes = []

            for (const arg of routes) {
                if (document.location.pathname === arg.route) {
                    content.push(arg)
                }
                if (arg.noRoute) {
                    noRoutes.push(arg)
                }
            }

            if (!content.length) {
                content.push(...noRoutes)
            }


            if (!this.getKey('loaded')) {
                this.setKey('loaded', true)
                this.set($content(...content))
            }
        })
    }, $tag('section'), $content(''))
    routers.push(element)
    return element
}

function $route(route) {
    return {
        route: route
    }
}

function $noRoute() {
    return {
        noRoute: true
    }
}
window.addEventListener('popstate', () =>
{
    routers.forEach(r => {
        try {
            $handle(r).setKey('loaded', false)
            r.update()
        } catch {
            console.warn('Failed updating router: ', r)
        }
    })
})


function $navigate(route) {
    window.history.pushState({},"", route);
    routers.forEach(r => {
        try {
            $handle(r).setKey('loaded', false)
            r.update()
        } catch {
            console.warn('Failed updating router: ', r)
        }
    })
}
