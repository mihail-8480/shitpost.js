function $render(selector, content) {
    const selected = document.querySelector(selector)
    if (!selected) {
        throw new Error(`The element with selector '${selector}' was not found.`)
    }
    return [...$renderContent(selected, content)]
}

function *$renderContent(root, content) {
    if (!content) {
        return
    }

    if (content.render) {
        for (const element of content.render()) {
            yield element
        }
    } else {
        const iter = content.bound ? content.bound.content : content
        for(const element of iter) {
            yield *$renderElement(root, element)
        }
    }
}

function *$renderElement(root, element, replace) {
    if (typeof element === "string") {
        if (!replace) {
            root.append(element)
        } else {
            root.parentElement.replaceChild(element, root)
        }
        yield element
    } else if (typeof element === "object") {
        const it = $elementToDOM(element)
        const dom = it.next().value
        if (!replace) {
            root.append(dom)
        } else {
            root.parentElement.replaceChild(dom, root)
        }
        yield element
        yield *it
        queueMicrotask(() => {
            if (element.effects) {
                for (const effect of element.effects) {
                    effect()
                }
            }
        })

    } else {
        throw new TypeError('Invalid element type')
    }
}

function *$elementToDOM(element) {
    if (!element.tag) {
        throw new Error('No tag was specified.')
    }

    const domElement = document.createElement(element.tag)

    if (element.className) {
        domElement.className = element.className
    }

    if (element.id) {
        domElement.id = element.id
    }

    for(const attrKey of Object.keys(element).filter(x => x.startsWith('attr.'))) {
        const attrIdx = attrKey.indexOf('.')
        const name = attrKey.substring(attrIdx + 1)
        const value = element[attrKey]
        domElement.setAttribute(name, value)
    }

    for(const styleIndex of Object.keys(element).filter(x => x.startsWith('style.'))) {
        const attrIdx = styleIndex.indexOf('.')
        const name = styleIndex.substring(attrIdx + 1)
        domElement.style[name] =  element[styleIndex]
    }

    yield domElement

    if (element.bound) {
        element.bound.attach(domElement, true)
        yield* $renderContent(domElement, element.bound.content)
    }

}

function $tag(tag) {
    return {
        tag: tag
    }
}

function $class(name) {
    return {
        className: name
    }
}

function $id(id) {
    return {
        id: id
    }
}

function $attribute(name, value) {
    const obj = {}
    obj['attr.'+name] = value;
    return obj;
}


function $style(name, value) {
    const obj = {}
    obj['style.'+name] = value;
    return obj;
}

function ShitpostElement() {
    this.onAttachEffects = []
    for (const arg of arguments) {
        if (typeof arg === "object") {
            this.set({...arg})
        } else if (typeof arg === "function") {
            this.addOnAttachEffect(arg)
        } else {
            throw new TypeError('Invalid argument')
        }
    }
    if (!this.bound) {
        this.bound = new ShitpostContent()
    }

}

ShitpostElement.prototype.set = function () {
    for(const arg of arguments) {
        for (const key in arg) {
            if (arg[key] instanceof ShitpostContent) {
                arg[key].setParent(this)
                if (this.bound) {
                    arg[key].attach(this.bound.selected)
                }
            }

            this[key] = arg[key]
        }
    }
}

ShitpostElement.prototype.addOnAttachEffect = function(e) {
    this.onAttachEffects.push(e.bind(this))
}


ShitpostElement.prototype.addEffect = function(e) {
    if (!this.effects) {
        this.effects = []
    }

    this.effects.push(e.bind(this))
}

ShitpostElement.prototype.update = function() {
    if (!this.updateRequested) {
        this.updateRequested = true;
        queueMicrotask(() => {
            try {
                if (this.bound) {
                    $consume(this.bound.render())
                }
            } finally {
                this.updateRequested = false;
            }
        })
    }
}

function ShitpostContent() {
    this.content = [...arguments]
}

ShitpostContent.prototype.render = function() {
    return $renderElement(this.selected, this.parent, true)
}

ShitpostContent.prototype.setParent = function(p) {
    this.parent = p
}


ShitpostContent.prototype.attach = function(selected, invoke) {

    if (invoke && this.parent && this.parent.onAttachEffects) {
        for (const effect of this.parent.onAttachEffects) {
            effect()
        }
    }
    this.selected = selected
}

function $content() {
    return {
        bound: new ShitpostContent(...arguments)
    }
}

function $element() {
    return new ShitpostElement(...arguments)
}

function $consume(it) {
    if (it && it.next) {
        while(!it.next().done) {

        }
    }
}

function ShitpostHandle(element) {
    this.element = element
}

ShitpostHandle.prototype.set = function() {
    this.element.set(...arguments)
    this.element.update()
    return this
}

ShitpostHandle.prototype.event = function(name, handler) {
    handler = handler.bind(this)
    this.element.bound.selected['on' + name] = function(e) {
        handler(e, this)
    }
    return this
}

ShitpostHandle.prototype.setKey = function(key, value) {
    if (!this.element.state) {
        this.element.state = {}
    }
    this.element.state[key] = value
}

ShitpostHandle.prototype.getKey = function(key) {
    if (!this.element.state) {
        this.element.state = {}
    }
    return this.element.state[key]
}

ShitpostHandle.prototype.effect = function(handler) {
    this.element.addEffect(() => handler.bind(this)())
    return this
}

function $handle(element) {
    if (element instanceof ShitpostHandle) {
        return element
    }
    return new ShitpostHandle(element)
}

function $eventEffect(name, func) {
    return function() {
        this.event(name, (e,t) => func.bind(this)(e,t))
    }
}

function $on(name, func) {
    return function() {
        $handle(this).effect($eventEffect(name, func))
    }
}
