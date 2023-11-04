
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const ActiveTab = writable('your wallet');
    const ActiveCard = writable('savings');
    const checkDetail = writable(false);
    const Detail = writable({
        iban: '',
        name: '',
        amount: 0,
        info: '',
        date: '',
        imageUrl: ''
    });
    const CardsTransactions = writable([
        {
            name: 'savings',
            balance: 7500,
            cardNumber: '4500 7845 3452 1234',
            cardColour: 'blue',
            cardType: 'credit card',
            transactions: [
                {
                    id: 123,
                    date: '02/04/2023',
                    name: 'ricardo gonzalez',
                    amount: 890,
                    iban: '324cv567k4t',
                    detail: 'Some kind of message from a player',
                    type: 'credit'
                },
                {
                    id: 103,
                    date: '09/12/2023',
                    name: 'john smith',
                    amount: 390,
                    iban: '3459oiu90r5',
                    detail: 'Some kind of message from a player',
                    type: 'debit'
                },
                {
                    id: 503,
                    date: '01/04/2023',
                    name: 'klose ettt',
                    amount: 890,
                    iban: '234gr1245u',
                    detail: 'payment anyway na way',
                    type: 'credit'
                },
                {
                    id: 403,
                    date: '09/12/2023',
                    name: 'yeye kere',
                    amount: 3900,
                    iban: '3459oiu90r5',
                    detail: 'Some kind of message from a player',
                    type: 'credit'
                },
                {
                    id: 593,
                    date: '01/04/2023',
                    name: 'hosanna',
                    amount: 890,
                    iban: '234gr1245u',
                    detail: 'payment anyway na way',
                    type: 'credit'
                },
                {
                    id: 173,
                    date: '09/12/2023',
                    name: 'john wick',
                    amount: 390,
                    iban: '3459oiu90r5',
                    detail: 'Some kind of message from a player',
                    type: 'debit'
                },
                {
                    id: 703,
                    date: '01/04/2023',
                    name: 'shuuutt ettt',
                    amount: 890,
                    iban: '234gr1245u',
                    detail: 'payment anyway na way',
                    type: 'credit'
                },
            ]
        },
        {
            name: 'expenditures',
            balance: 10000,
            cardNumber: '9000 5400 9764 2345',
            cardColour: 'purple',
            cardType: 'debit card',
            transactions: [
                {
                    id: 163,
                    date: '03/05/2023',
                    name: 'sheamus john',
                    amount: 2400,
                    iban: '2345op345r4',
                    detail: 'take it and gooo',
                    type: 'credit'
                },
                {
                    id: 173,
                    date: '05/05/2023',
                    name: 'vreal akins',
                    amount: 1000,
                    iban: '3245typ905',
                    detail: 'take it good, yeah loop through',
                    type: 'credit'
                },
                {
                    id: 113,
                    date: '09/08/2023',
                    name: 'Mo Salah',
                    amount: 3090,
                    iban: '4r234bg678',
                    detail: 'loop through it',
                    type: 'credit'
                },
            ]
        },
        {
            name: 'billings',
            balance: 2500,
            cardNumber: '2134 9870 6458 3451',
            cardColour: 'yellow',
            cardType: 'debit card',
            transactions: [
                {
                    id: 139,
                    date: '02/03/2023',
                    name: 'john wick',
                    amount: 900,
                    iban: '90856uipoe2',
                    detail: 'i no kill your dog boss',
                    type: 'debit'
                },
                {
                    id: 145,
                    date: '09/08/2023',
                    name: 'iya alamala',
                    amount: 890,
                    iban: '234509865rt',
                    detail: 'hunger wan kill me die',
                    type: 'debit'
                },
                {
                    id: 345,
                    date: '09/08/2023',
                    name: 'test net',
                    amount: 500,
                    iban: '67890ret56uy',
                    detail: 'na money',
                    type: 'credit'
                },
            ]
        }
    ]);

    const FriendsList = writable([
        {
            id: 1,
            name: 'crimsonStorm',
            online: true,
            iban: '345Gds23455',
            about: 'send funds abeg, sapa dey world',
            imageUrl: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=60&w=600&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGhlYWRzaG90JTIwYW5pbWF0ZWR8ZW58MHwwfDB8fHww',
        },
        {
            id: 2,
            name: 'KiraTheKiller',
            online: true,
            iban: '234hjt890po',
            about: 'you coming to the abattoir today, lots of meat to kill',
            imageUrl: 'https://static.wikia.nocookie.net/serialkills/images/1/1a/LightYagami.jpg/revision/latest?cb=20110606093444',
        },
        {
            id: 3,
            name: 'Kurapika',
            online: true,
            iban: '34290uop907',
            about: 'i made a pact, i have to fulfil it',
            imageUrl: 'https://preview.redd.it/s6zxfjmjejz51.jpg?width=512&format=pjpg&auto=webp&s=9a4d37de39255adace81dccfeb7a40ad0afae097',
        },
        {
            id: 4,
            name: 'Olga the Gore',
            online: false,
            iban: 'io9087yt56j',
            about: 'gosh, i need to sleep',
            imageUrl: 'https://i.pinimg.com/474x/51/96/b3/5196b34be5aec2079e4b68190299a544.jpg',
        },
        {
            id: 5,
            name: 'hildeceptor',
            online: false,
            iban: '345hj56790',
            about: 'come for a snack, want an apple?',
            imageUrl: 'data:image/jpeg;base64,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',
        },
        {
            id: 6,
            name: 'MightGuyy',
            online: false,
            iban: '345jkil908',
            about: 'all will be fine, just smile',
            imageUrl: 'data:image/png;base64,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',
        },
        {
            id: 7,
            name: 'XvX',
            online: true,
            iban: '890jkil7889',
            about: 'venommm',
            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc_B-jX4Jl6cw6m3ILliMwyvZXhvjmWtqlmg&usqp=CAU',
        },
    ]);

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        const [value, unit] = split_css_unit(amount);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * value}${unit});`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const primary_property = axis === 'y' ? 'height' : 'width';
        const primary_property_value = parseFloat(style[primary_property]);
        const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
        const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
        const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
        const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
        const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
        const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
        const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
        const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `${primary_property}: ${t * primary_property_value}px;` +
                `padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
                `padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
                `margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
                `margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
                `border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
                `border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src\components\PhoneDetail.svelte generated by Svelte v3.59.2 */

    const file$b = "src\\components\\PhoneDetail.svelte";

    function create_fragment$b(ctx) {
    	let div3;
    	let p;
    	let t1;
    	let svg0;
    	let rect;
    	let ellipse;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let line;
    	let defs;
    	let radialGradient0;
    	let stop0;
    	let stop1;
    	let stop2;
    	let stop3;
    	let stop4;
    	let stop5;
    	let radialGradient1;
    	let stop6;
    	let stop7;
    	let stop8;
    	let radialGradient2;
    	let stop9;
    	let stop10;
    	let stop11;
    	let t2;
    	let section;
    	let div0;
    	let svg1;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let t3;
    	let div1;
    	let svg2;
    	let path8;
    	let t4;
    	let div2;
    	let svg3;
    	let path9;
    	let path10;
    	let path11;
    	let t5;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p = element("p");
    			p.textContent = "10:00";
    			t1 = space();
    			svg0 = svg_element("svg");
    			rect = svg_element("rect");
    			ellipse = svg_element("ellipse");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			line = svg_element("line");
    			defs = svg_element("defs");
    			radialGradient0 = svg_element("radialGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			stop2 = svg_element("stop");
    			stop3 = svg_element("stop");
    			stop4 = svg_element("stop");
    			stop5 = svg_element("stop");
    			radialGradient1 = svg_element("radialGradient");
    			stop6 = svg_element("stop");
    			stop7 = svg_element("stop");
    			stop8 = svg_element("stop");
    			radialGradient2 = svg_element("radialGradient");
    			stop9 = svg_element("stop");
    			stop10 = svg_element("stop");
    			stop11 = svg_element("stop");
    			t2 = space();
    			section = element("section");
    			div0 = element("div");
    			svg1 = svg_element("svg");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			t3 = space();
    			div1 = element("div");
    			svg2 = svg_element("svg");
    			path8 = svg_element("path");
    			t4 = space();
    			div2 = element("div");
    			svg3 = svg_element("svg");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			t5 = space();
    			img = element("img");
    			add_location(p, file$b, 5, 4, 57);
    			attr_dev(rect, "x", "0.975098");
    			attr_dev(rect, "y", "0.978516");
    			attr_dev(rect, "width", "80.9999");
    			attr_dev(rect, "height", "22.1674");
    			attr_dev(rect, "rx", "10.5201");
    			attr_dev(rect, "fill", "#0A0A0A");
    			add_location(rect, file$b, 8, 8, 197);
    			attr_dev(ellipse, "cx", "70.7151");
    			attr_dev(ellipse, "cy", "12.0622");
    			attr_dev(ellipse, "rx", "11.2602");
    			attr_dev(ellipse, "ry", "11.0837");
    			attr_dev(ellipse, "fill", "#0A0A0A");
    			add_location(ellipse, file$b, 9, 8, 301);
    			attr_dev(path0, "d", "M70.7341 18.4849C74.1811 18.4849 76.9744 15.6822 76.9744 12.2262C76.9744 8.77021 74.1811 5.96753 70.7341 5.96753C67.2871 5.96753 64.4938 8.77021 64.4938 12.2262C64.4938 15.6822 67.2871 18.4849 70.7341 18.4849Z");
    			attr_dev(path0, "fill", "url(#paint0_radial_11136_6038)");
    			add_location(path0, file$b, 11, 10, 417);
    			attr_dev(path1, "d", "M70.7341 18.4849C74.1811 18.4849 76.9744 15.6822 76.9744 12.2262C76.9744 8.77021 74.1811 5.96753 70.7341 5.96753C67.2871 5.96753 64.4938 8.77021 64.4938 12.2262C64.4938 15.6822 67.2871 18.4849 70.7341 18.4849Z");
    			attr_dev(path1, "fill", "url(#paint1_angular_11136_6038)");
    			add_location(path1, file$b, 12, 10, 688);
    			attr_dev(path2, "d", "M70.7341 18.4849C74.1811 18.4849 76.9744 15.6822 76.9744 12.2262C76.9744 8.77021 74.1811 5.96753 70.7341 5.96753C67.2871 5.96753 64.4938 8.77021 64.4938 12.2262C64.4938 15.6822 67.2871 18.4849 70.7341 18.4849Z");
    			attr_dev(path2, "fill", "url(#paint2_angular_11136_6038)");
    			add_location(path2, file$b, 13, 10, 960);
    			attr_dev(path3, "d", "M70.7341 18.4849C74.1811 18.4849 76.9744 15.6822 76.9744 12.2262C76.9744 8.77021 74.1811 5.96753 70.7341 5.96753C67.2871 5.96753 64.4938 8.77021 64.4938 12.2262C64.4938 15.6822 67.2871 18.4849 70.7341 18.4849Z");
    			attr_dev(path3, "stroke", "#080F21");
    			attr_dev(path3, "stroke-width", "0.396489");
    			add_location(path3, file$b, 14, 10, 1232);
    			attr_dev(g, "opacity", "0.7");
    			add_location(g, file$b, 10, 8, 388);
    			attr_dev(line, "opacity", "0.7");
    			attr_dev(line, "x1", "70.7264");
    			attr_dev(line, "y1", "6.16577");
    			attr_dev(line, "x2", "70.7264");
    			attr_dev(line, "y2", "18.2867");
    			attr_dev(line, "stroke", "black");
    			attr_dev(line, "stroke-width", "0.991223");
    			add_location(line, file$b, 16, 8, 1518);
    			attr_dev(stop0, "offset", "0.213542");
    			add_location(stop0, file$b, 19, 12, 1850);
    			attr_dev(stop1, "offset", "0.270833");
    			attr_dev(stop1, "stop-color", "#081A32");
    			add_location(stop1, file$b, 20, 12, 1889);
    			attr_dev(stop2, "offset", "0.395833");
    			attr_dev(stop2, "stop-color", "#1F3A58");
    			add_location(stop2, file$b, 21, 12, 1949);
    			attr_dev(stop3, "offset", "0.515625");
    			attr_dev(stop3, "stop-color", "#375F90");
    			add_location(stop3, file$b, 22, 12, 2009);
    			attr_dev(stop4, "offset", "0.713542");
    			attr_dev(stop4, "stop-color", "#274871");
    			add_location(stop4, file$b, 23, 12, 2069);
    			attr_dev(stop5, "offset", "0.916667");
    			attr_dev(stop5, "stop-color", "#0D1528");
    			add_location(stop5, file$b, 24, 12, 2129);
    			attr_dev(radialGradient0, "id", "paint0_radial_11136_6038");
    			attr_dev(radialGradient0, "cx", "0");
    			attr_dev(radialGradient0, "cy", "0");
    			attr_dev(radialGradient0, "r", "1");
    			attr_dev(radialGradient0, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient0, "gradientTransform", "translate(70.7341 12.2262) rotate(90) scale(6.06045 6.04208)");
    			add_location(radialGradient0, file$b, 18, 10, 1658);
    			attr_dev(stop6, "offset", "0.411458");
    			attr_dev(stop6, "stop-opacity", "0");
    			add_location(stop6, file$b, 27, 12, 2409);
    			attr_dev(stop7, "offset", "0.510417");
    			add_location(stop7, file$b, 28, 12, 2465);
    			attr_dev(stop8, "offset", "0.817708");
    			attr_dev(stop8, "stop-opacity", "0");
    			add_location(stop8, file$b, 29, 12, 2504);
    			attr_dev(radialGradient1, "id", "paint1_angular_11136_6038");
    			attr_dev(radialGradient1, "cx", "0");
    			attr_dev(radialGradient1, "cy", "0");
    			attr_dev(radialGradient1, "r", "1");
    			attr_dev(radialGradient1, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient1, "gradientTransform", "translate(70.7341 12.2262) rotate(90) scale(6.06045 6.04208)");
    			add_location(radialGradient1, file$b, 26, 10, 2216);
    			add_location(stop9, file$b, 32, 12, 2780);
    			attr_dev(stop10, "offset", "0.166667");
    			attr_dev(stop10, "stop-opacity", "0");
    			add_location(stop10, file$b, 33, 12, 2801);
    			attr_dev(stop11, "offset", "0.885417");
    			attr_dev(stop11, "stop-opacity", "0");
    			add_location(stop11, file$b, 34, 12, 2857);
    			attr_dev(radialGradient2, "id", "paint2_angular_11136_6038");
    			attr_dev(radialGradient2, "cx", "0");
    			attr_dev(radialGradient2, "cy", "0");
    			attr_dev(radialGradient2, "r", "1");
    			attr_dev(radialGradient2, "gradientUnits", "userSpaceOnUse");
    			attr_dev(radialGradient2, "gradientTransform", "translate(70.7341 12.2262) rotate(90) scale(6.06045 6.04208)");
    			add_location(radialGradient2, file$b, 31, 10, 2587);
    			add_location(defs, file$b, 17, 8, 1640);
    			attr_dev(svg0, "class", "camera svelte-1r0evmv");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "82");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 82 24");
    			attr_dev(svg0, "fill", "none");
    			add_location(svg0, file$b, 7, 4, 77);
    			attr_dev(path4, "d", "M8.91852 3.05904C8.91852 2.60016 9.29052 2.22816 9.7494 2.22816H10.5803C11.0392 2.22816 11.4112 2.60016 11.4112 3.05904V9.70607C11.4112 10.1649 11.0392 10.5369 10.5803 10.5369H9.7494C9.29052 10.5369 8.91852 10.1649 8.91852 9.70607V3.05904Z");
    			attr_dev(path4, "fill", "white");
    			add_location(path4, file$b, 42, 16, 3120);
    			attr_dev(path5, "d", "M13.0729 1.39728C13.0729 0.938403 13.4449 0.566406 13.9038 0.566406H14.7347C15.1936 0.566406 15.5656 0.938403 15.5656 1.39728V9.70607C15.5656 10.1649 15.1936 10.5369 14.7347 10.5369H13.9038C13.4449 10.5369 13.0729 10.1649 13.0729 9.70607V1.39728Z");
    			attr_dev(path5, "fill", "white");
    			add_location(path5, file$b, 43, 16, 3402);
    			attr_dev(path6, "d", "M4.76413 5.96711C4.76413 5.50823 5.13613 5.13624 5.59501 5.13624H6.42589C6.88477 5.13624 7.25677 5.50823 7.25677 5.96711V9.70607C7.25677 10.1649 6.88477 10.5369 6.42589 10.5369H5.59501C5.13613 10.5369 4.76413 10.1649 4.76413 9.70607V5.96711Z");
    			attr_dev(path6, "fill", "white");
    			add_location(path6, file$b, 44, 16, 3691);
    			attr_dev(path7, "d", "M0.609741 8.04431C0.609741 7.58543 0.981738 7.21343 1.44062 7.21343H2.2715C2.73038 7.21343 3.10238 7.58543 3.10238 8.04431V9.70607C3.10238 10.1649 2.73038 10.5369 2.2715 10.5369H1.44062C0.981738 10.5369 0.609741 10.1649 0.609741 9.70607V8.04431Z");
    			attr_dev(path7, "fill", "white");
    			add_location(path7, file$b, 45, 16, 3975);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "16");
    			attr_dev(svg1, "height", "11");
    			attr_dev(svg1, "viewBox", "0 0 16 11");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "class", "svelte-1r0evmv");
    			add_location(svg1, file$b, 41, 12, 3007);
    			add_location(div0, file$b, 40, 8, 2988);
    			attr_dev(path8, "fill-rule", "evenodd");
    			attr_dev(path8, "clip-rule", "evenodd");
    			attr_dev(path8, "d", "M7.27538 2.71633C9.32479 2.71642 11.2958 3.52022 12.7811 4.9616C12.893 5.07288 13.0717 5.07148 13.1819 4.95846L14.251 3.85706C14.3068 3.79973 14.3379 3.72208 14.3375 3.64129C14.337 3.5605 14.305 3.48323 14.2486 3.42657C10.3502 -0.386982 4.19997 -0.386982 0.301564 3.42657C0.245093 3.48318 0.213052 3.56043 0.212531 3.64123C0.21201 3.72202 0.243053 3.79969 0.298789 3.85706L1.36825 4.95846C1.47833 5.07165 1.65724 5.07305 1.76902 4.9616C3.2545 3.52013 5.22577 2.71632 7.27538 2.71633ZM7.30485 6.04157C8.43087 6.0415 9.5167 6.46871 10.3514 7.2402C10.4643 7.34969 10.6421 7.34732 10.7521 7.23485L11.8201 6.13346C11.8763 6.07569 11.9075 5.99731 11.9067 5.91587C11.9059 5.83444 11.8731 5.75673 11.8157 5.70014C9.27402 3.28677 5.33784 3.28677 2.79612 5.70014C2.73871 5.75673 2.70595 5.83447 2.70519 5.91594C2.70444 5.9974 2.73575 6.07577 2.79211 6.13346L3.85972 7.23485C3.96977 7.34732 4.1476 7.34969 4.26049 7.2402C5.09461 6.46922 6.17958 6.04204 7.30485 6.04157ZM9.4764 8.19107C9.47804 8.27274 9.44659 8.35147 9.38947 8.40869L7.5422 10.3116C7.48805 10.3675 7.41422 10.399 7.33719 10.399C7.26016 10.399 7.18633 10.3675 7.13218 10.3116L5.2846 8.40869C5.22752 8.35143 5.19613 8.27267 5.19782 8.191C5.19951 8.10933 5.23414 8.032 5.29354 7.97725C6.47327 6.95873 8.2011 6.95873 9.38084 7.97725C9.44019 8.03204 9.47477 8.1094 9.4764 8.19107Z");
    			attr_dev(path8, "fill", "white");
    			add_location(path8, file$b, 50, 16, 4423);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "15");
    			attr_dev(svg2, "height", "11");
    			attr_dev(svg2, "viewBox", "0 0 15 11");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "class", "svelte-1r0evmv");
    			add_location(svg2, file$b, 49, 12, 4310);
    			add_location(div1, file$b, 48, 8, 4291);
    			attr_dev(path9, "opacity", "0.35");
    			attr_dev(path9, "d", "M0.592255 4.05911C0.592255 2.46566 1.884 1.17392 3.47744 1.17392H17.6024C19.1958 1.17392 20.4876 2.46566 20.4876 4.05911V8.2135C20.4876 9.80695 19.1958 11.0987 17.6024 11.0987H3.47744C1.88399 11.0987 0.592255 9.80695 0.592255 8.2135V4.05911Z");
    			attr_dev(path9, "stroke", "white");
    			attr_dev(path9, "stroke-width", "0.876648");
    			add_location(path9, file$b, 55, 16, 5996);
    			attr_dev(path10, "opacity", "0.4");
    			attr_dev(path10, "d", "M21.7567 4.89014V8.39673C22.4622 8.09974 22.9209 7.40886 22.9209 6.64343C22.9209 5.878 22.4622 5.18712 21.7567 4.89014Z");
    			attr_dev(path10, "fill", "white");
    			add_location(path10, file$b, 56, 16, 6321);
    			attr_dev(path11, "d", "M1.81567 4.05922C1.81567 3.14145 2.55967 2.39746 3.47743 2.39746H14.2788C15.1966 2.39746 15.9406 3.14145 15.9406 4.05922V8.21361C15.9406 9.13137 15.1966 9.87537 14.2788 9.87537H3.47743C2.55967 9.87537 1.81567 9.13137 1.81567 8.21361V4.05922Z");
    			attr_dev(path11, "fill", "white");
    			add_location(path11, file$b, 57, 16, 6497);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "width", "23");
    			attr_dev(svg3, "height", "12");
    			attr_dev(svg3, "viewBox", "0 0 23 12");
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "class", "svelte-1r0evmv");
    			add_location(svg3, file$b, 54, 12, 5883);
    			add_location(div2, file$b, 53, 8, 5864);
    			if (!src_url_equal(img.src, img_src_value = "../static/line.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1r0evmv");
    			add_location(img, file$b, 60, 8, 6809);
    			attr_dev(section, "class", "svelte-1r0evmv");
    			add_location(section, file$b, 39, 6, 2969);
    			attr_dev(div3, "class", "phone-detail svelte-1r0evmv");
    			add_location(div3, file$b, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p);
    			append_dev(div3, t1);
    			append_dev(div3, svg0);
    			append_dev(svg0, rect);
    			append_dev(svg0, ellipse);
    			append_dev(svg0, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(g, path3);
    			append_dev(svg0, line);
    			append_dev(svg0, defs);
    			append_dev(defs, radialGradient0);
    			append_dev(radialGradient0, stop0);
    			append_dev(radialGradient0, stop1);
    			append_dev(radialGradient0, stop2);
    			append_dev(radialGradient0, stop3);
    			append_dev(radialGradient0, stop4);
    			append_dev(radialGradient0, stop5);
    			append_dev(defs, radialGradient1);
    			append_dev(radialGradient1, stop6);
    			append_dev(radialGradient1, stop7);
    			append_dev(radialGradient1, stop8);
    			append_dev(defs, radialGradient2);
    			append_dev(radialGradient2, stop9);
    			append_dev(radialGradient2, stop10);
    			append_dev(radialGradient2, stop11);
    			append_dev(div3, t2);
    			append_dev(div3, section);
    			append_dev(section, div0);
    			append_dev(div0, svg1);
    			append_dev(svg1, path4);
    			append_dev(svg1, path5);
    			append_dev(svg1, path6);
    			append_dev(svg1, path7);
    			append_dev(section, t3);
    			append_dev(section, div1);
    			append_dev(div1, svg2);
    			append_dev(svg2, path8);
    			append_dev(section, t4);
    			append_dev(section, div2);
    			append_dev(div2, svg3);
    			append_dev(svg3, path9);
    			append_dev(svg3, path10);
    			append_dev(svg3, path11);
    			append_dev(section, t5);
    			append_dev(section, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PhoneDetail', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PhoneDetail> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PhoneDetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PhoneDetail",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\components\Header.svelte generated by Svelte v3.59.2 */
    const file$a = "src\\components\\Header.svelte";

    function create_fragment$a(ctx) {
    	let header;
    	let div1;
    	let h4;
    	let t0;
    	let t1;
    	let div0;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			h4 = element("h4");
    			t0 = text(/*$ActiveTab*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			attr_dev(h4, "class", "svelte-1yv9i8n");
    			add_location(h4, file$a, 8, 8, 183);
    			if (!src_url_equal(img.src, img_src_value = "../static/profile-picture.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "profile ");
    			add_location(img, file$a, 10, 12, 233);
    			add_location(div0, file$a, 9, 8, 214);
    			attr_dev(div1, "class", "header-content svelte-1yv9i8n");
    			add_location(div1, file$a, 7, 4, 145);
    			attr_dev(header, "class", "svelte-1yv9i8n");
    			add_location(header, file$a, 6, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, h4);
    			append_dev(h4, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ActiveTab*/ 1) set_data_dev(t0, /*$ActiveTab*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $ActiveTab;
    	validate_store(ActiveTab, 'ActiveTab');
    	component_subscribe($$self, ActiveTab, $$value => $$invalidate(0, $ActiveTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ActiveTab,
    		createEventDispatcher,
    		$ActiveTab
    	});

    	return [$ActiveTab];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Menu.svelte generated by Svelte v3.59.2 */
    const file$9 = "src\\components\\Menu.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let div;
    	let svg0;
    	let path0;
    	let t0;
    	let svg1;
    	let path1;
    	let t1;
    	let svg2;
    	let path2;
    	let t2;
    	let svg3;
    	let path3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t2 = space();
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M11.6735 3.02971L11.8247 3.22818L11.6735 3.02971L3.79849 9.02971C3.62776 9.15979 3.48954 9.32819 3.39447 9.52136C3.2994 9.71451 3.25 9.92728 3.25 10.1429V19.8571C3.25 20.2253 3.39392 20.5791 3.65134 20.8406C3.90889 21.1023 4.25905 21.25 4.625 21.25H9.125C9.49095 21.25 9.84111 21.1023 10.0987 20.8406C10.3561 20.5791 10.5 20.2253 10.5 19.8571V16.4286C10.5 16.1905 10.5931 15.963 10.7577 15.7958C10.9221 15.6288 11.1442 15.5357 11.375 15.5357H13.625C13.8558 15.5357 14.0779 15.6288 14.2423 15.7958C14.4069 15.963 14.5 16.1905 14.5 16.4286V19.8571C14.5 20.2253 14.6439 20.5791 14.9013 20.8406C15.1589 21.1023 15.509 21.25 15.875 21.25H20.375C20.741 21.25 21.0911 21.1023 21.3487 20.8406C21.6061 20.5791 21.75 20.2253 21.75 19.8571V10.1429C21.75 9.92728 21.7006 9.71451 21.6055 9.52136C21.5105 9.3282 21.3722 9.15979 21.2015 9.02971L13.3265 3.02971L13.175 3.22857L13.3265 3.02971C13.0885 2.84838 12.7985 2.75 12.5 2.75C12.2015 2.75 11.9115 2.84838 11.6735 3.02971Z");
    			attr_dev(path0, "stroke", "#fff");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "stroke-opacity", "0.5");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "class", "svelte-arwhvf");
    			add_location(path0, file$9, 15, 12, 620);
    			attr_dev(svg0, "class", "links wallet svelte-arwhvf");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "25");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 25 24");
    			attr_dev(svg0, "fill", "none");
    			toggle_class(svg0, "active", /*$ActiveTab*/ ctx[0] === 'your wallet');
    			add_location(svg0, file$9, 14, 8, 381);
    			attr_dev(path1, "d", "M9.46663 19.75C9.86245 19.75 10.2046 19.52 10.3666 19.1864C10.5287 19.52 10.8708 19.75 11.2666 19.75H21.1666C21.7189 19.75 22.1666 19.3023 22.1666 18.75V16.5804C22.1666 15.7974 21.7926 15.1696 21.3276 14.7101C20.8713 14.2594 20.2842 13.9227 19.7034 13.6737C18.751 13.2653 17.6533 13.0244 16.7605 12.9519C17.0087 12.9078 17.2513 12.8335 17.4833 12.7305C17.8824 12.5534 18.2403 12.2959 18.5387 11.9762C18.8369 11.6567 19.0701 11.2811 19.2281 10.8724C19.3861 10.4638 19.4666 10.028 19.4666 9.58929C19.4666 8.70612 19.1398 7.84642 18.5387 7.20233C17.9353 6.55592 17.1017 6.17857 16.2166 6.17857C15.3315 6.17857 14.4979 6.55592 13.8946 7.20234C13.5606 7.56019 13.3113 7.98461 13.1556 8.44264C13.1629 8.34314 13.1666 8.24314 13.1666 8.14286C13.1666 7.13182 12.7924 6.14949 12.1069 5.41498C11.4192 4.67814 10.4711 4.25 9.46663 4.25C8.46219 4.25 7.5141 4.67814 6.82638 5.41498C6.14084 6.14949 5.76663 7.13182 5.76663 8.14286C5.76663 9.1539 6.14084 10.1362 6.82638 10.8707C7.37844 11.4622 8.09828 11.8548 8.88037 11.9867C7.75937 12.0677 6.35119 12.3692 5.13619 12.8902C4.41469 13.1995 3.70093 13.6116 3.15324 14.1528C2.5967 14.7027 2.16663 15.4359 2.16663 16.3393V18.75C2.16663 19.3023 2.61434 19.75 3.16663 19.75H9.46663ZM15.6724 12.952C14.7797 13.0245 13.6821 13.2653 12.7299 13.6737C12.6233 13.7194 12.5165 13.768 12.4103 13.8198C12.5623 13.6093 12.6298 13.3431 12.5871 13.0762C12.5222 12.6711 12.2166 12.3468 11.816 12.258C11.2089 12.1234 10.6009 12.0285 10.0489 11.9873C10.8325 11.8561 11.5539 11.4632 12.1069 10.8707C12.5037 10.4455 12.7963 9.93723 12.9723 9.3884C12.9685 9.45517 12.9666 9.52216 12.9666 9.58929C12.9666 10.028 13.0472 10.4638 13.2052 10.8724C13.3632 11.2811 13.5964 11.6567 13.8946 11.9762C14.3724 12.4882 14.9946 12.8313 15.6724 12.952Z");
    			attr_dev(path1, "stroke", "white");
    			attr_dev(path1, "stroke-opacity", "0.5");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "class", "svelte-arwhvf");
    			add_location(path1, file$9, 19, 12, 1962);
    			attr_dev(svg1, "class", "links friends svelte-arwhvf");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "25");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 25 24");
    			attr_dev(svg1, "fill", "none");
    			toggle_class(svg1, "active", /*$ActiveTab*/ ctx[0] === 'your friends');
    			add_location(svg1, file$9, 18, 8, 1720);
    			attr_dev(path2, "d", "M5.83338 19C5.28338 19 4.81238 18.804 4.42038 18.412C4.02838 18.02 3.83271 17.5493 3.83338 17V7C3.83338 6.45 4.02938 5.979 4.42138 5.587C4.81338 5.195 5.28404 4.99934 5.83338 5H19.8334C20.3834 5 20.8544 5.196 21.2464 5.588C21.6384 5.98 21.834 6.45067 21.8334 7V17C21.8334 17.55 21.6374 18.021 21.2454 18.413C20.8534 18.805 20.3827 19.0007 19.8334 19H5.83338ZM3.83338 13H21.8334V9H3.83338V13Z");
    			attr_dev(path2, "stroke", "white");
    			attr_dev(path2, "stroke-opacity", "0.5");
    			attr_dev(path2, "stroke-width", "2");
    			attr_dev(path2, "class", "svelte-arwhvf");
    			add_location(path2, file$9, 23, 12, 4066);
    			attr_dev(svg2, "class", "links cards svelte-arwhvf");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "width", "25");
    			attr_dev(svg2, "height", "24");
    			attr_dev(svg2, "viewBox", "0 0 25 24");
    			attr_dev(svg2, "fill", "none");
    			toggle_class(svg2, "active", /*$ActiveTab*/ ctx[0] === 'your cards');
    			add_location(svg2, file$9, 22, 8, 3830);
    			attr_dev(path3, "d", "M8.707 11.7572C8.79997 11.8501 8.87373 11.9604 8.92406 12.0818C8.97438 12.2032 9.00028 12.3333 9.00028 12.4647C9.00028 12.5961 8.97438 12.7263 8.92406 12.8477C8.87373 12.9691 8.79997 13.0793 8.707 13.1722L6.88 15.0002H16.5C16.7652 15.0002 17.0196 15.1056 17.2071 15.2931C17.3946 15.4806 17.5 15.735 17.5 16.0002C17.5 16.2654 17.3946 16.5198 17.2071 16.7073C17.0196 16.8949 16.7652 17.0002 16.5 17.0002H6.88L8.708 18.8282C8.80091 18.9211 8.87462 19.0313 8.92493 19.1526C8.97524 19.274 9.00115 19.404 9.0012 19.5354C9.00125 19.6667 8.97542 19.7968 8.9252 19.9182C8.87498 20.0395 8.80134 20.1498 8.7085 20.2427C8.61565 20.3356 8.50542 20.4093 8.38408 20.4596C8.26275 20.51 8.1327 20.5359 8.00135 20.5359C7.87 20.536 7.73993 20.5101 7.61856 20.4599C7.49719 20.4097 7.38691 20.3361 7.294 20.2432L3.758 16.7072C3.57053 16.5197 3.46521 16.2654 3.46521 16.0002C3.46521 15.7351 3.57053 15.4807 3.758 15.2932L7.294 11.7572C7.48152 11.5697 7.73583 11.4644 8.001 11.4644C8.26616 11.4644 8.52047 11.5697 8.708 11.7572H8.707ZM16.293 3.75722C16.4652 3.58504 16.6943 3.48161 16.9373 3.46633C17.1803 3.45105 17.4206 3.52497 17.613 3.67422L17.707 3.75722L21.243 7.29322C21.4152 7.46541 21.5186 7.69451 21.5339 7.93754C21.5492 8.18056 21.4752 8.42081 21.326 8.61322L21.243 8.70722L17.707 12.2422C17.527 12.4216 17.2856 12.5257 17.0316 12.5334C16.7777 12.5412 16.5303 12.452 16.3397 12.284C16.1492 12.1159 16.0297 11.8817 16.0056 11.6287C15.9815 11.3758 16.0546 11.1232 16.21 10.9222L16.293 10.8282L18.12 9.00022H8.5C8.24512 8.99993 7.99996 8.90234 7.81463 8.72737C7.62929 8.5524 7.51776 8.31326 7.50282 8.05882C7.48789 7.80438 7.57067 7.55384 7.73426 7.35838C7.89785 7.16293 8.1299 7.03732 8.383 7.00722L8.5 7.00022H18.121L16.293 5.17022C16.1055 4.98269 16.0002 4.72838 16.0002 4.46322C16.0002 4.19805 16.1055 3.94474 16.293 3.75722Z");
    			attr_dev(path3, "fill", "white");
    			attr_dev(path3, "fill-opacity", "0.5");
    			attr_dev(path3, "class", "svelte-arwhvf");
    			add_location(path3, file$9, 27, 12, 4785);
    			attr_dev(svg3, "class", "links transfer svelte-arwhvf");
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "width", "25");
    			attr_dev(svg3, "height", "24");
    			attr_dev(svg3, "viewBox", "0 0 25 24");
    			attr_dev(svg3, "fill", "none");
    			toggle_class(svg3, "active", /*$ActiveTab*/ ctx[0] === 'transfer');
    			add_location(svg3, file$9, 26, 8, 4550);
    			attr_dev(div, "class", "content svelte-arwhvf");
    			add_location(div, file$9, 13, 4, 350);
    			attr_dev(section, "class", "menu svelte-arwhvf");
    			add_location(section, file$9, 12, 0, 322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, svg0);
    			append_dev(svg0, path0);
    			append_dev(div, t0);
    			append_dev(div, svg1);
    			append_dev(svg1, path1);
    			append_dev(div, t1);
    			append_dev(div, svg2);
    			append_dev(svg2, path2);
    			append_dev(div, t2);
    			append_dev(div, svg3);
    			append_dev(svg3, path3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(svg0, "keydown", keydown_handler$5, false, false, false, false),
    					listen_dev(svg1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
    					listen_dev(svg1, "keydown", keydown_handler_1$1, false, false, false, false),
    					listen_dev(svg2, "click", /*click_handler_2*/ ctx[4], false, false, false, false),
    					listen_dev(svg2, "keydown", keydown_handler_2, false, false, false, false),
    					listen_dev(svg3, "click", /*click_handler_3*/ ctx[5], false, false, false, false),
    					listen_dev(svg3, "keydown", keydown_handler_3, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ActiveTab*/ 1) {
    				toggle_class(svg0, "active", /*$ActiveTab*/ ctx[0] === 'your wallet');
    			}

    			if (dirty & /*$ActiveTab*/ 1) {
    				toggle_class(svg1, "active", /*$ActiveTab*/ ctx[0] === 'your friends');
    			}

    			if (dirty & /*$ActiveTab*/ 1) {
    				toggle_class(svg2, "active", /*$ActiveTab*/ ctx[0] === 'your cards');
    			}

    			if (dirty & /*$ActiveTab*/ 1) {
    				toggle_class(svg3, "active", /*$ActiveTab*/ ctx[0] === 'transfer');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler$5 = () => {
    	
    };

    const keydown_handler_1$1 = () => {
    	
    };

    const keydown_handler_2 = () => {
    	
    };

    const keydown_handler_3 = () => {
    	
    };

    function instance$9($$self, $$props, $$invalidate) {
    	let $ActiveTab;
    	validate_store(ActiveTab, 'ActiveTab');
    	component_subscribe($$self, ActiveTab, $$value => $$invalidate(0, $ActiveTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const dispatch = createEventDispatcher();
    	let active = 'wallet';

    	const changePage = tab => {
    		ActiveTab.set(tab);
    		checkDetail.set(false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => changePage('your wallet');
    	const click_handler_1 = () => changePage('your friends');
    	const click_handler_2 = () => changePage('your cards');
    	const click_handler_3 = () => changePage('transfer');

    	$$self.$capture_state = () => ({
    		ActiveTab,
    		checkDetail,
    		createEventDispatcher,
    		dispatch,
    		active,
    		changePage,
    		$ActiveTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('active' in $$props) active = $$props.active;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$ActiveTab,
    		changePage,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\Transaction.svelte generated by Svelte v3.59.2 */
    const file$8 = "src\\components\\Transaction.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*transaction*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = (/*transaction*/ ctx[0].type === 'debit' ? '- ' : '+ ') + "";
    	let t2;
    	let t3;
    	let t4_value = /*transaction*/ ctx[0].amount + "";
    	let t4;
    	let t5;
    	let p1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = text(" USD");
    			attr_dev(p0, "class", "name svelte-do3ct5");
    			add_location(p0, file$8, 17, 4, 492);

    			attr_dev(p1, "class", p1_class_value = "amount " + (/*transaction*/ ctx[0].type === 'debit'
    			? 'negative'
    			: 'positive'));

    			add_location(p1, file$8, 18, 4, 536);
    			attr_dev(div, "class", "transaction svelte-do3ct5");
    			add_location(div, file$8, 16, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*handleClick*/ ctx[1], false, false, false, false),
    					listen_dev(div, "keydown", keydown_handler$4, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*transaction*/ 1 && t0_value !== (t0_value = /*transaction*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*transaction*/ 1 && t2_value !== (t2_value = (/*transaction*/ ctx[0].type === 'debit' ? '- ' : '+ ') + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*transaction*/ 1 && t4_value !== (t4_value = /*transaction*/ ctx[0].amount + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*transaction*/ 1 && p1_class_value !== (p1_class_value = "amount " + (/*transaction*/ ctx[0].type === 'debit'
    			? 'negative'
    			: 'positive'))) {
    				attr_dev(p1, "class", p1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler$4 = () => {
    	
    };

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Transaction', slots, []);
    	let { transaction } = $$props;

    	const handleClick = () => {
    		checkDetail.set(true);

    		Detail.set({
    			iban: transaction.iban,
    			name: transaction.name,
    			info: transaction.detail,
    			date: transaction.date,
    			amount: transaction.amount,
    			type: transaction.type
    		});
    	};

    	$$self.$$.on_mount.push(function () {
    		if (transaction === undefined && !('transaction' in $$props || $$self.$$.bound[$$self.$$.props['transaction']])) {
    			console.warn("<Transaction> was created without expected prop 'transaction'");
    		}
    	});

    	const writable_props = ['transaction'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Transaction> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('transaction' in $$props) $$invalidate(0, transaction = $$props.transaction);
    	};

    	$$self.$capture_state = () => ({
    		Detail,
    		checkDetail,
    		transaction,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('transaction' in $$props) $$invalidate(0, transaction = $$props.transaction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [transaction, handleClick];
    }

    class Transaction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { transaction: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Transaction",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get transaction() {
    		throw new Error("<Transaction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transaction(value) {
    		throw new Error("<Transaction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\shared\Card.svelte generated by Svelte v3.59.2 */
    const file$7 = "src\\components\\shared\\Card.svelte";

    function create_fragment$7(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let p0;
    	let t2;
    	let h1;
    	let t3;
    	let t4_value = /*cardDetail*/ ctx[0].balance + "";
    	let t4;
    	let t5;
    	let t6;
    	let div2;
    	let p1;
    	let t7_value = /*cardDetail*/ ctx[0].cardType + "";
    	let t7;
    	let t8;
    	let h3;
    	let t9_value = /*cardDetail*/ ctx[0].cardNumber + "";
    	let t9;
    	let div4_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Your Balance";
    			t2 = space();
    			h1 = element("h1");
    			t3 = text("$");
    			t4 = text(t4_value);
    			t5 = text(".00");
    			t6 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			h3 = element("h3");
    			t9 = text(t9_value);
    			attr_dev(div0, "class", "overlay svelte-1f05xu2");
    			add_location(div0, file$7, 12, 8, 589);
    			attr_dev(p0, "class", "svelte-1f05xu2");
    			add_location(p0, file$7, 15, 16, 684);
    			attr_dev(h1, "class", "svelte-1f05xu2");
    			add_location(h1, file$7, 16, 16, 721);
    			add_location(div1, file$7, 14, 12, 661);
    			attr_dev(p1, "class", "svelte-1f05xu2");
    			add_location(p1, file$7, 19, 16, 811);
    			attr_dev(h3, "class", "svelte-1f05xu2");
    			add_location(h3, file$7, 20, 16, 857);
    			add_location(div2, file$7, 18, 12, 788);
    			attr_dev(div3, "class", "content svelte-1f05xu2");
    			add_location(div3, file$7, 13, 8, 626);
    			attr_dev(div4, "class", div4_class_value = "card " + /*cardDetail*/ ctx[0].cardColour + " svelte-1f05xu2");
    			set_style(div4, "background", "url(../static/" + /*cardDetail*/ ctx[0].cardColour + ".png)");
    			set_style(div4, "aspect-ratio", "268/153");
    			set_style(div4, "background-repeat", "no-repeat");
    			set_style(div4, "background-size", "cover");
    			add_location(div4, file$7, 11, 4, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t2);
    			append_dev(div1, h1);
    			append_dev(h1, t3);
    			append_dev(h1, t4);
    			append_dev(h1, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t7);
    			append_dev(div2, t8);
    			append_dev(div2, h3);
    			append_dev(h3, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div4,
    						"click",
    						function () {
    							if (is_function(/*switchCard*/ ctx[1](/*cardDetail*/ ctx[0].name))) /*switchCard*/ ctx[1](/*cardDetail*/ ctx[0].name).apply(this, arguments);
    						},
    						false,
    						false,
    						false,
    						false
    					),
    					listen_dev(div4, "keydown", keydown_handler$3, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*cardDetail*/ 1 && t4_value !== (t4_value = /*cardDetail*/ ctx[0].balance + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*cardDetail*/ 1 && t7_value !== (t7_value = /*cardDetail*/ ctx[0].cardType + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*cardDetail*/ 1 && t9_value !== (t9_value = /*cardDetail*/ ctx[0].cardNumber + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*cardDetail*/ 1 && div4_class_value !== (div4_class_value = "card " + /*cardDetail*/ ctx[0].cardColour + " svelte-1f05xu2")) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (dirty & /*cardDetail*/ 1) {
    				set_style(div4, "background", "url(../static/" + /*cardDetail*/ ctx[0].cardColour + ".png)");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler$3 = () => {
    	
    };

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { cardDetail } = $$props;

    	const switchCard = name => {
    		ActiveCard.set(name);
    		ActiveTab.set('your wallet');
    	};

    	$$self.$$.on_mount.push(function () {
    		if (cardDetail === undefined && !('cardDetail' in $$props || $$self.$$.bound[$$self.$$.props['cardDetail']])) {
    			console.warn("<Card> was created without expected prop 'cardDetail'");
    		}
    	});

    	const writable_props = ['cardDetail'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cardDetail' in $$props) $$invalidate(0, cardDetail = $$props.cardDetail);
    	};

    	$$self.$capture_state = () => ({
    		ActiveCard,
    		ActiveTab,
    		quintOut,
    		fade,
    		slide,
    		scale,
    		cardDetail,
    		switchCard
    	});

    	$$self.$inject_state = $$props => {
    		if ('cardDetail' in $$props) $$invalidate(0, cardDetail = $$props.cardDetail);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cardDetail, switchCard];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { cardDetail: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get cardDetail() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardDetail(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\Home.svelte generated by Svelte v3.59.2 */
    const file$6 = "src\\components\\Pages\\Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (16:12) {#each currentCard[0].transactions as transaction (transaction.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let transaction;
    	let current;

    	transaction = new Transaction({
    			props: { transaction: /*transaction*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(transaction.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(transaction, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transaction.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transaction.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(transaction, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(16:12) {#each currentCard[0].transactions as transaction (transaction.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section1;
    	let card;
    	let t0;
    	let div;
    	let p;
    	let t2;
    	let section0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	card = new Card({
    			props: { cardDetail: /*currentCard*/ ctx[0][0] },
    			$$inline: true
    		});

    	let each_value = /*currentCard*/ ctx[0][0].transactions;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*transaction*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			create_component(card.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "Last Transactions";
    			t2 = space();
    			section0 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "svelte-1vxrms2");
    			add_location(p, file$6, 12, 8, 452);
    			attr_dev(section0, "class", "transactions svelte-1vxrms2");
    			add_location(section0, file$6, 14, 8, 488);
    			add_location(div, file$6, 11, 4, 437);
    			add_location(section1, file$6, 9, 0, 379);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			mount_component(card, section1, null);
    			append_dev(section1, t0);
    			append_dev(section1, div);
    			append_dev(div, p);
    			append_dev(div, t2);
    			append_dev(div, section0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(section0, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentCard*/ 1) {
    				each_value = /*currentCard*/ ctx[0][0].transactions;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section0, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_component(card);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $ActiveCard;
    	let $CardsTransactions;
    	validate_store(ActiveCard, 'ActiveCard');
    	component_subscribe($$self, ActiveCard, $$value => $$invalidate(1, $ActiveCard = $$value));
    	validate_store(CardsTransactions, 'CardsTransactions');
    	component_subscribe($$self, CardsTransactions, $$value => $$invalidate(2, $CardsTransactions = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let currentCard = $CardsTransactions.filter(card => card.name === $ActiveCard);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		slide,
    		quintOut,
    		ActiveCard,
    		CardsTransactions,
    		Transaction,
    		Card,
    		currentCard,
    		$ActiveCard,
    		$CardsTransactions
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentCard' in $$props) $$invalidate(0, currentCard = $$props.currentCard);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentCard];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Friend.svelte generated by Svelte v3.59.2 */
    const file$5 = "src\\components\\Friend.svelte";

    // (58:8) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let g0;
    	let path0;
    	let g1;
    	let path1;
    	let defs;
    	let filter0;
    	let feFlood0;
    	let feColorMatrix0;
    	let feOffset0;
    	let feGaussianBlur0;
    	let feComposite0;
    	let feColorMatrix1;
    	let feBlend0;
    	let feBlend1;
    	let filter1;
    	let feFlood1;
    	let feColorMatrix2;
    	let feOffset1;
    	let feGaussianBlur1;
    	let feComposite1;
    	let feColorMatrix3;
    	let feBlend2;
    	let feBlend3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			defs = svg_element("defs");
    			filter0 = svg_element("filter");
    			feFlood0 = svg_element("feFlood");
    			feColorMatrix0 = svg_element("feColorMatrix");
    			feOffset0 = svg_element("feOffset");
    			feGaussianBlur0 = svg_element("feGaussianBlur");
    			feComposite0 = svg_element("feComposite");
    			feColorMatrix1 = svg_element("feColorMatrix");
    			feBlend0 = svg_element("feBlend");
    			feBlend1 = svg_element("feBlend");
    			filter1 = svg_element("filter");
    			feFlood1 = svg_element("feFlood");
    			feColorMatrix2 = svg_element("feColorMatrix");
    			feOffset1 = svg_element("feOffset");
    			feGaussianBlur1 = svg_element("feGaussianBlur");
    			feComposite1 = svg_element("feComposite");
    			feColorMatrix3 = svg_element("feColorMatrix");
    			feBlend2 = svg_element("feBlend");
    			feBlend3 = svg_element("feBlend");
    			attr_dev(path0, "d", "M0 13C2.20914 13 4 14.7909 4 17V35C4 37.2091 2.20914 39 0 39V13Z");
    			attr_dev(path0, "fill", "#FF2828");
    			attr_dev(path0, "fill-opacity", "0.4");
    			attr_dev(path0, "shape-rendering", "crispEdges");
    			add_location(path0, file$5, 60, 14, 3196);
    			attr_dev(g0, "filter", "url(#filter0_d_17200_736)");
    			add_location(g0, file$5, 59, 12, 3142);
    			attr_dev(path1, "d", "M0 15C1.10457 15 2 15.8954 2 17V35C2 36.1046 1.10457 37 0 37V15Z");
    			attr_dev(path1, "fill", "#FF2828");
    			attr_dev(path1, "fill-opacity", "0.7");
    			attr_dev(path1, "shape-rendering", "crispEdges");
    			add_location(path1, file$5, 63, 14, 3421);
    			attr_dev(g1, "filter", "url(#filter1_d_17200_736)");
    			add_location(g1, file$5, 62, 12, 3367);
    			attr_dev(feFlood0, "flood-opacity", "0");
    			attr_dev(feFlood0, "result", "BackgroundImageFix");
    			add_location(feFlood0, file$5, 67, 16, 3766);
    			attr_dev(feColorMatrix0, "in", "SourceAlpha");
    			attr_dev(feColorMatrix0, "type", "matrix");
    			attr_dev(feColorMatrix0, "values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
    			attr_dev(feColorMatrix0, "result", "hardAlpha");
    			add_location(feColorMatrix0, file$5, 68, 16, 3840);
    			add_location(feOffset0, file$5, 69, 16, 3975);
    			attr_dev(feGaussianBlur0, "stdDeviation", "5");
    			add_location(feGaussianBlur0, file$5, 70, 16, 4004);
    			attr_dev(feComposite0, "in2", "hardAlpha");
    			attr_dev(feComposite0, "operator", "out");
    			add_location(feComposite0, file$5, 71, 16, 4056);
    			attr_dev(feColorMatrix1, "type", "matrix");
    			attr_dev(feColorMatrix1, "values", "0 0 0 0 1 0 0 0 0 0.156863 0 0 0 0 0.156863 0 0 0 0.25 0");
    			add_location(feColorMatrix1, file$5, 72, 16, 4119);
    			attr_dev(feBlend0, "mode", "normal");
    			attr_dev(feBlend0, "in2", "BackgroundImageFix");
    			attr_dev(feBlend0, "result", "effect1_dropShadow_17200_736");
    			add_location(feBlend0, file$5, 73, 16, 4233);
    			attr_dev(feBlend1, "mode", "normal");
    			attr_dev(feBlend1, "in", "SourceGraphic");
    			attr_dev(feBlend1, "in2", "effect1_dropShadow_17200_736");
    			attr_dev(feBlend1, "result", "shape");
    			add_location(feBlend1, file$5, 74, 16, 4338);
    			attr_dev(filter0, "id", "filter0_d_17200_736");
    			attr_dev(filter0, "x", "-10");
    			attr_dev(filter0, "y", "3");
    			attr_dev(filter0, "width", "24");
    			attr_dev(filter0, "height", "46");
    			attr_dev(filter0, "filterUnits", "userSpaceOnUse");
    			attr_dev(filter0, "color-interpolation-filters", "sRGB");
    			add_location(filter0, file$5, 66, 14, 3614);
    			attr_dev(feFlood1, "flood-opacity", "0");
    			attr_dev(feFlood1, "result", "BackgroundImageFix");
    			add_location(feFlood1, file$5, 77, 16, 4624);
    			attr_dev(feColorMatrix2, "in", "SourceAlpha");
    			attr_dev(feColorMatrix2, "type", "matrix");
    			attr_dev(feColorMatrix2, "values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
    			attr_dev(feColorMatrix2, "result", "hardAlpha");
    			add_location(feColorMatrix2, file$5, 78, 16, 4698);
    			add_location(feOffset1, file$5, 79, 16, 4833);
    			attr_dev(feGaussianBlur1, "stdDeviation", "7.5");
    			add_location(feGaussianBlur1, file$5, 80, 16, 4862);
    			attr_dev(feComposite1, "in2", "hardAlpha");
    			attr_dev(feComposite1, "operator", "out");
    			add_location(feComposite1, file$5, 81, 16, 4916);
    			attr_dev(feColorMatrix3, "type", "matrix");
    			attr_dev(feColorMatrix3, "values", "0 0 0 0 0.341176 0 0 0 0 1 0 0 0 0 0.686275 0 0 0 0.45 0");
    			add_location(feColorMatrix3, file$5, 82, 16, 4979);
    			attr_dev(feBlend2, "mode", "normal");
    			attr_dev(feBlend2, "in2", "BackgroundImageFix");
    			attr_dev(feBlend2, "result", "effect1_dropShadow_17200_736");
    			add_location(feBlend2, file$5, 83, 16, 5093);
    			attr_dev(feBlend3, "mode", "normal");
    			attr_dev(feBlend3, "in", "SourceGraphic");
    			attr_dev(feBlend3, "in2", "effect1_dropShadow_17200_736");
    			attr_dev(feBlend3, "result", "shape");
    			add_location(feBlend3, file$5, 84, 16, 5198);
    			attr_dev(filter1, "id", "filter1_d_17200_736");
    			attr_dev(filter1, "x", "-15");
    			attr_dev(filter1, "y", "0");
    			attr_dev(filter1, "width", "32");
    			attr_dev(filter1, "height", "52");
    			attr_dev(filter1, "filterUnits", "userSpaceOnUse");
    			attr_dev(filter1, "color-interpolation-filters", "sRGB");
    			add_location(filter1, file$5, 76, 14, 4472);
    			add_location(defs, file$5, 65, 12, 3592);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "17");
    			attr_dev(svg, "height", "52");
    			attr_dev(svg, "viewBox", "0 0 17 52");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-1ketsf8");
    			add_location(svg, file$5, 58, 8, 3033);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, path0);
    			append_dev(svg, g1);
    			append_dev(g1, path1);
    			append_dev(svg, defs);
    			append_dev(defs, filter0);
    			append_dev(filter0, feFlood0);
    			append_dev(filter0, feColorMatrix0);
    			append_dev(filter0, feOffset0);
    			append_dev(filter0, feGaussianBlur0);
    			append_dev(filter0, feComposite0);
    			append_dev(filter0, feColorMatrix1);
    			append_dev(filter0, feBlend0);
    			append_dev(filter0, feBlend1);
    			append_dev(defs, filter1);
    			append_dev(filter1, feFlood1);
    			append_dev(filter1, feColorMatrix2);
    			append_dev(filter1, feOffset1);
    			append_dev(filter1, feGaussianBlur1);
    			append_dev(filter1, feComposite1);
    			append_dev(filter1, feColorMatrix3);
    			append_dev(filter1, feBlend2);
    			append_dev(filter1, feBlend3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(58:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if status === 'online'}
    function create_if_block$2(ctx) {
    	let svg;
    	let g0;
    	let path0;
    	let g1;
    	let path1;
    	let defs;
    	let filter0;
    	let feFlood0;
    	let feColorMatrix0;
    	let feOffset0;
    	let feGaussianBlur0;
    	let feComposite0;
    	let feColorMatrix1;
    	let feBlend0;
    	let feBlend1;
    	let filter1;
    	let feFlood1;
    	let feColorMatrix2;
    	let feOffset1;
    	let feGaussianBlur1;
    	let feComposite1;
    	let feColorMatrix3;
    	let feBlend2;
    	let feBlend3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			defs = svg_element("defs");
    			filter0 = svg_element("filter");
    			feFlood0 = svg_element("feFlood");
    			feColorMatrix0 = svg_element("feColorMatrix");
    			feOffset0 = svg_element("feOffset");
    			feGaussianBlur0 = svg_element("feGaussianBlur");
    			feComposite0 = svg_element("feComposite");
    			feColorMatrix1 = svg_element("feColorMatrix");
    			feBlend0 = svg_element("feBlend");
    			feBlend1 = svg_element("feBlend");
    			filter1 = svg_element("filter");
    			feFlood1 = svg_element("feFlood");
    			feColorMatrix2 = svg_element("feColorMatrix");
    			feOffset1 = svg_element("feOffset");
    			feGaussianBlur1 = svg_element("feGaussianBlur");
    			feComposite1 = svg_element("feComposite");
    			feColorMatrix3 = svg_element("feColorMatrix");
    			feBlend2 = svg_element("feBlend");
    			feBlend3 = svg_element("feBlend");
    			attr_dev(path0, "d", "M0 13C2.20914 13 4 14.7909 4 17V35C4 37.2091 2.20914 39 0 39V13Z");
    			attr_dev(path0, "fill", "#57FFAF");
    			attr_dev(path0, "fill-opacity", "0.4");
    			attr_dev(path0, "shape-rendering", "crispEdges");
    			add_location(path0, file$5, 29, 10, 955);
    			attr_dev(g0, "filter", "url(#filter0_d_17200_129)");
    			add_location(g0, file$5, 28, 8, 905);
    			attr_dev(path1, "d", "M0 15C1.10457 15 2 15.8954 2 17V35C2 36.1046 1.10457 37 0 37V15Z");
    			attr_dev(path1, "fill", "#57FFAF");
    			attr_dev(path1, "fill-opacity", "0.7");
    			attr_dev(path1, "shape-rendering", "crispEdges");
    			add_location(path1, file$5, 32, 10, 1168);
    			attr_dev(g1, "filter", "url(#filter1_d_17200_129)");
    			add_location(g1, file$5, 31, 8, 1118);
    			attr_dev(feFlood0, "flood-opacity", "0");
    			attr_dev(feFlood0, "result", "BackgroundImageFix");
    			add_location(feFlood0, file$5, 36, 12, 1497);
    			attr_dev(feColorMatrix0, "in", "SourceAlpha");
    			attr_dev(feColorMatrix0, "type", "matrix");
    			attr_dev(feColorMatrix0, "values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
    			attr_dev(feColorMatrix0, "result", "hardAlpha");
    			add_location(feColorMatrix0, file$5, 37, 12, 1567);
    			add_location(feOffset0, file$5, 38, 12, 1698);
    			attr_dev(feGaussianBlur0, "stdDeviation", "5");
    			add_location(feGaussianBlur0, file$5, 39, 12, 1723);
    			attr_dev(feComposite0, "in2", "hardAlpha");
    			attr_dev(feComposite0, "operator", "out");
    			add_location(feComposite0, file$5, 40, 12, 1771);
    			attr_dev(feColorMatrix1, "type", "matrix");
    			attr_dev(feColorMatrix1, "values", "0 0 0 0 0.341176 0 0 0 0 1 0 0 0 0 0.686275 0 0 0 0.25 0");
    			add_location(feColorMatrix1, file$5, 41, 12, 1830);
    			attr_dev(feBlend0, "mode", "normal");
    			attr_dev(feBlend0, "in2", "BackgroundImageFix");
    			attr_dev(feBlend0, "result", "effect1_dropShadow_17200_129");
    			add_location(feBlend0, file$5, 42, 12, 1940);
    			attr_dev(feBlend1, "mode", "normal");
    			attr_dev(feBlend1, "in", "SourceGraphic");
    			attr_dev(feBlend1, "in2", "effect1_dropShadow_17200_129");
    			attr_dev(feBlend1, "result", "shape");
    			add_location(feBlend1, file$5, 43, 12, 2041);
    			attr_dev(filter0, "id", "filter0_d_17200_129");
    			attr_dev(filter0, "x", "-10");
    			attr_dev(filter0, "y", "3");
    			attr_dev(filter0, "width", "24");
    			attr_dev(filter0, "height", "46");
    			attr_dev(filter0, "filterUnits", "userSpaceOnUse");
    			attr_dev(filter0, "color-interpolation-filters", "sRGB");
    			add_location(filter0, file$5, 35, 10, 1349);
    			attr_dev(feFlood1, "flood-opacity", "0");
    			attr_dev(feFlood1, "result", "BackgroundImageFix");
    			add_location(feFlood1, file$5, 46, 12, 2315);
    			attr_dev(feColorMatrix2, "in", "SourceAlpha");
    			attr_dev(feColorMatrix2, "type", "matrix");
    			attr_dev(feColorMatrix2, "values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
    			attr_dev(feColorMatrix2, "result", "hardAlpha");
    			add_location(feColorMatrix2, file$5, 47, 12, 2385);
    			add_location(feOffset1, file$5, 48, 12, 2516);
    			attr_dev(feGaussianBlur1, "stdDeviation", "7.5");
    			add_location(feGaussianBlur1, file$5, 49, 12, 2541);
    			attr_dev(feComposite1, "in2", "hardAlpha");
    			attr_dev(feComposite1, "operator", "out");
    			add_location(feComposite1, file$5, 50, 12, 2591);
    			attr_dev(feColorMatrix3, "type", "matrix");
    			attr_dev(feColorMatrix3, "values", "0 0 0 0 0.341176 0 0 0 0 1 0 0 0 0 0.686275 0 0 0 0.45 0");
    			add_location(feColorMatrix3, file$5, 51, 12, 2650);
    			attr_dev(feBlend2, "mode", "normal");
    			attr_dev(feBlend2, "in2", "BackgroundImageFix");
    			attr_dev(feBlend2, "result", "effect1_dropShadow_17200_129");
    			add_location(feBlend2, file$5, 52, 12, 2760);
    			attr_dev(feBlend3, "mode", "normal");
    			attr_dev(feBlend3, "in", "SourceGraphic");
    			attr_dev(feBlend3, "in2", "effect1_dropShadow_17200_129");
    			attr_dev(feBlend3, "result", "shape");
    			add_location(feBlend3, file$5, 53, 12, 2861);
    			attr_dev(filter1, "id", "filter1_d_17200_129");
    			attr_dev(filter1, "x", "-15");
    			attr_dev(filter1, "y", "0");
    			attr_dev(filter1, "width", "32");
    			attr_dev(filter1, "height", "52");
    			attr_dev(filter1, "filterUnits", "userSpaceOnUse");
    			attr_dev(filter1, "color-interpolation-filters", "sRGB");
    			add_location(filter1, file$5, 45, 10, 2167);
    			add_location(defs, file$5, 34, 8, 1331);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "17");
    			attr_dev(svg, "height", "52");
    			attr_dev(svg, "viewBox", "0 0 17 52");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "class", "svelte-1ketsf8");
    			add_location(svg, file$5, 27, 4, 800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, path0);
    			append_dev(svg, g1);
    			append_dev(g1, path1);
    			append_dev(svg, defs);
    			append_dev(defs, filter0);
    			append_dev(filter0, feFlood0);
    			append_dev(filter0, feColorMatrix0);
    			append_dev(filter0, feOffset0);
    			append_dev(filter0, feGaussianBlur0);
    			append_dev(filter0, feComposite0);
    			append_dev(filter0, feColorMatrix1);
    			append_dev(filter0, feBlend0);
    			append_dev(filter0, feBlend1);
    			append_dev(defs, filter1);
    			append_dev(filter1, feFlood1);
    			append_dev(filter1, feColorMatrix2);
    			append_dev(filter1, feOffset1);
    			append_dev(filter1, feGaussianBlur1);
    			append_dev(filter1, feComposite1);
    			append_dev(filter1, feColorMatrix3);
    			append_dev(filter1, feBlend2);
    			append_dev(filter1, feBlend3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(27:4) {#if status === 'online'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div1;
    	let p;
    	let t1;
    	let p_class_value;
    	let t2;
    	let h4;
    	let t3_value = /*friend*/ ctx[0].name + "";
    	let t3;
    	let t4;
    	let div2_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*status*/ ctx[1] === 'online') return create_if_block$2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text(/*status*/ ctx[1]);
    			t2 = space();
    			h4 = element("h4");
    			t3 = text(t3_value);
    			t4 = space();
    			if_block.c();
    			if (!src_url_equal(img.src, img_src_value = /*friend*/ ctx[0].imageUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*friend*/ ctx[0].name);
    			attr_dev(img, "class", "svelte-1ketsf8");
    			add_location(img, file$5, 20, 8, 598);
    			attr_dev(div0, "class", "img-cont svelte-1ketsf8");
    			add_location(div0, file$5, 19, 4, 566);
    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(/*status*/ ctx[1]) + " svelte-1ketsf8"));
    			add_location(p, file$5, 23, 8, 676);
    			attr_dev(h4, "class", "name svelte-1ketsf8");
    			add_location(h4, file$5, 24, 8, 716);
    			add_location(div1, file$5, 22, 4, 661);
    			attr_dev(div2, "class", div2_class_value = "" + (/*status*/ ctx[1] + "-cont friend" + " svelte-1ketsf8"));
    			add_location(div2, file$5, 18, 0, 480);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t1);
    			append_dev(div1, t2);
    			append_dev(div1, h4);
    			append_dev(h4, t3);
    			append_dev(div2, t4);
    			if_block.m(div2, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", /*handleClick*/ ctx[2], false, false, false, false),
    					listen_dev(div2, "keydown", keydown_handler$2, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*friend*/ 1 && !src_url_equal(img.src, img_src_value = /*friend*/ ctx[0].imageUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*friend*/ 1 && img_alt_value !== (img_alt_value = /*friend*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*status*/ 2) set_data_dev(t1, /*status*/ ctx[1]);

    			if (dirty & /*status*/ 2 && p_class_value !== (p_class_value = "" + (null_to_empty(/*status*/ ctx[1]) + " svelte-1ketsf8"))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*friend*/ 1 && t3_value !== (t3_value = /*friend*/ ctx[0].name + "")) set_data_dev(t3, t3_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (dirty & /*status*/ 2 && div2_class_value !== (div2_class_value = "" + (/*status*/ ctx[1] + "-cont friend" + " svelte-1ketsf8"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler$2 = () => {
    	
    };

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Friend', slots, []);
    	let { friend } = $$props;
    	let status;
    	friend.online ? status = 'online' : status = 'offline';

    	const handleClick = () => {
    		checkDetail.set(true);

    		Detail.set({
    			iban: friend.iban,
    			name: friend.name,
    			imageUrl: friend.imageUrl,
    			info: friend.about
    		});
    	};

    	$$self.$$.on_mount.push(function () {
    		if (friend === undefined && !('friend' in $$props || $$self.$$.bound[$$self.$$.props['friend']])) {
    			console.warn("<Friend> was created without expected prop 'friend'");
    		}
    	});

    	const writable_props = ['friend'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Friend> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('friend' in $$props) $$invalidate(0, friend = $$props.friend);
    	};

    	$$self.$capture_state = () => ({
    		checkDetail,
    		Detail,
    		quintOut,
    		fade,
    		slide,
    		scale,
    		friend,
    		status,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('friend' in $$props) $$invalidate(0, friend = $$props.friend);
    		if ('status' in $$props) $$invalidate(1, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [friend, status, handleClick];
    }

    class Friend extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { friend: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Friend",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get friend() {
    		throw new Error("<Friend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set friend(value) {
    		throw new Error("<Friend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\Friends.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\components\\Pages\\Friends.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:4) {#each $FriendsList as friend }
    function create_each_block$1(ctx) {
    	let div;
    	let friend;
    	let current;

    	friend = new Friend({
    			props: { friend: /*friend*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(friend.$$.fragment);
    			add_location(div, file$4, 9, 8, 283);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(friend, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const friend_changes = {};
    			if (dirty & /*$FriendsList*/ 1) friend_changes.friend = /*friend*/ ctx[1];
    			friend.$set(friend_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(friend.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(friend.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(friend);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:4) {#each $FriendsList as friend }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let current;
    	let each_value = /*$FriendsList*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "class", "svelte-1imin83");
    			add_location(section, file$4, 7, 0, 227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(section, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$FriendsList*/ 1) {
    				each_value = /*$FriendsList*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $FriendsList;
    	validate_store(FriendsList, 'FriendsList');
    	component_subscribe($$self, FriendsList, $$value => $$invalidate(0, $FriendsList = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Friends', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Friends> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		slide,
    		blur,
    		quintOut,
    		FriendsList,
    		Friend,
    		$FriendsList
    	});

    	return [$FriendsList];
    }

    class Friends extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Friends",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Pages\Cards.svelte generated by Svelte v3.59.2 */
    const file$3 = "src\\components\\Pages\\Cards.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (10:4) {#each cards as cardDetail (cardDetail.cardNumber) }
    function create_each_block(key_1, ctx) {
    	let first;
    	let card;
    	let current;

    	card = new Card({
    			props: { cardDetail: /*cardDetail*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(card.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const card_changes = {};
    			if (dirty & /*cards*/ 1) card_changes.cardDetail = /*cardDetail*/ ctx[2];
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:4) {#each cards as cardDetail (cardDetail.cardNumber) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*cards*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*cardDetail*/ ctx[2].cardNumber;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "class", "cards svelte-zv9oei");
    			add_location(section, file$3, 8, 0, 264);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(section, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cards*/ 1) {
    				each_value = /*cards*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let cards;
    	let $CardsTransactions;
    	validate_store(CardsTransactions, 'CardsTransactions');
    	component_subscribe($$self, CardsTransactions, $$value => $$invalidate(1, $CardsTransactions = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cards', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cards> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		quintOut,
    		fade,
    		slide,
    		CardsTransactions,
    		Card,
    		cards,
    		$CardsTransactions
    	});

    	$$self.$inject_state = $$props => {
    		if ('cards' in $$props) $$invalidate(0, cards = $$props.cards);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$CardsTransactions*/ 2) {
    			$$invalidate(0, cards = $CardsTransactions);
    		}
    	};

    	return [cards, $CardsTransactions];
    }

    class Cards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cards",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Pages\Transfer.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$2 = "src\\components\\Pages\\Transfer.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div0;
    	let svg0;
    	let path0;
    	let defs0;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let t0;
    	let p;
    	let t2;
    	let h2;
    	let t4;
    	let article;
    	let div2;
    	let input0;
    	let t5;
    	let div1;
    	let svg1;
    	let g;
    	let path1;
    	let defs1;
    	let clipPath;
    	let rect;
    	let t6;
    	let div3;
    	let input1;
    	let t7;
    	let div4;
    	let button0;
    	let t9;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			defs0 = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			t0 = space();
    			p = element("p");
    			p.textContent = "CHOOSE THE AMOUNT";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "TRANSFER MONEY";
    			t4 = space();
    			article = element("article");
    			div2 = element("div");
    			input0 = element("input");
    			t5 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			g = svg_element("g");
    			path1 = svg_element("path");
    			defs1 = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			t6 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t7 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "RESET";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "CONFIRM";
    			attr_dev(path0, "d", "M16.072 23.0241C16.2541 23.206 16.3986 23.422 16.4971 23.6597C16.5957 23.8975 16.6464 24.1523 16.6464 24.4096C16.6464 24.667 16.5957 24.9218 16.4971 25.1596C16.3986 25.3973 16.2541 25.6133 16.072 25.7952L12.4942 29.375H31.3333C31.8527 29.375 32.3508 29.5813 32.7181 29.9486C33.0854 30.3158 33.2917 30.8139 33.2917 31.3333C33.2917 31.8527 33.0854 32.3508 32.7181 32.7181C32.3508 33.0853 31.8527 33.2917 31.3333 33.2917H12.4942L16.074 36.8715C16.256 37.0533 16.4003 37.2692 16.4988 37.5068C16.5974 37.7444 16.6481 37.9991 16.6482 38.2563C16.6483 38.5136 16.5977 38.7683 16.4994 39.006C16.401 39.2436 16.2568 39.4596 16.075 39.6416C15.8932 39.8235 15.6773 39.9679 15.4397 40.0664C15.2021 40.1649 14.9474 40.2157 14.6902 40.2157C14.4329 40.2158 14.1782 40.1653 13.9405 40.0669C13.7029 39.9686 13.4869 39.8244 13.3049 39.6425L6.38026 32.7179C6.01313 32.3506 5.80688 31.8526 5.80688 31.3333C5.80688 30.8141 6.01313 30.316 6.38026 29.9488L13.3049 23.0241C13.6722 22.657 14.1702 22.4507 14.6895 22.4507C15.2087 22.4507 15.7068 22.657 16.074 23.0241H16.072ZM30.928 7.35746C31.2652 7.02028 31.7138 6.81772 32.1898 6.7878C32.6657 6.75787 33.1362 6.90263 33.513 7.19491L33.697 7.35746L40.6217 14.2821C40.9589 14.6193 41.1614 15.068 41.1914 15.5439C41.2213 16.0198 41.0765 16.4903 40.7843 16.8671L40.6217 17.0512L33.697 23.9739C33.3446 24.3251 32.8717 24.529 32.3744 24.5442C31.8771 24.5594 31.3927 24.3847 31.0195 24.0557C30.6463 23.7266 30.4123 23.2678 30.3651 22.7725C30.318 22.2772 30.4611 21.7825 30.7654 21.3889L30.928 21.2048L34.5058 17.625H15.6667C15.1675 17.6244 14.6874 17.4333 14.3245 17.0907C13.9615 16.748 13.7431 16.2797 13.7139 15.7814C13.6846 15.2832 13.8467 14.7925 14.1671 14.4097C14.4875 14.027 14.9419 13.781 15.4375 13.722L15.6667 13.7083H34.5078L30.928 10.1246C30.5608 9.75734 30.3546 9.25932 30.3546 8.74004C30.3546 8.22076 30.5608 7.7247 30.928 7.35746Z");
    			attr_dev(path0, "fill", "url(#paint0_linear_17200_828)");
    			add_location(path0, file$2, 24, 12, 674);
    			attr_dev(stop0, "stop-color", "#74A0FF");
    			add_location(stop0, file$2, 27, 16, 2769);
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "stop-color", "#235BD5");
    			add_location(stop1, file$2, 28, 16, 2815);
    			attr_dev(linearGradient, "id", "paint0_linear_17200_828");
    			attr_dev(linearGradient, "x1", "5.80688");
    			attr_dev(linearGradient, "y1", "6.78394");
    			attr_dev(linearGradient, "x2", "47.7279");
    			attr_dev(linearGradient, "y2", "21.1409");
    			attr_dev(linearGradient, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient, file$2, 26, 14, 2623);
    			add_location(defs0, file$2, 25, 12, 2601);
    			attr_dev(svg0, "class", "first svelte-yjaq5k");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "47");
    			attr_dev(svg0, "height", "47");
    			attr_dev(svg0, "viewBox", "0 0 47 47");
    			attr_dev(svg0, "fill", "none");
    			add_location(svg0, file$2, 23, 8, 552);
    			attr_dev(p, "class", "svelte-yjaq5k");
    			add_location(p, file$2, 33, 8, 2940);
    			attr_dev(h2, "class", "svelte-yjaq5k");
    			add_location(h2, file$2, 34, 8, 2974);
    			attr_dev(div0, "class", "svelte-yjaq5k");
    			add_location(div0, file$2, 22, 4, 537);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "");
    			attr_dev(input0, "id", "");
    			attr_dev(input0, "placeholder", "IBAN NUMBER");
    			attr_dev(input0, "class", "svelte-yjaq5k");
    			add_location(input0, file$2, 38, 12, 3085);
    			attr_dev(path1, "d", "M19.7917 20.8333H5.20833V4.16667H7.29167V7.29167H17.7083V4.16667H19.7917M12.5 2.08333C12.7763 2.08333 13.0412 2.19308 13.2366 2.38843C13.4319 2.58378 13.5417 2.84873 13.5417 3.125C13.5417 3.40127 13.4319 3.66622 13.2366 3.86157C13.0412 4.05692 12.7763 4.16667 12.5 4.16667C12.2237 4.16667 11.9588 4.05692 11.7634 3.86157C11.5681 3.66622 11.4583 3.40127 11.4583 3.125C11.4583 2.84873 11.5681 2.58378 11.7634 2.38843C11.9588 2.19308 12.2237 2.08333 12.5 2.08333ZM19.7917 2.08333H15.4375C15 0.875 13.8542 0 12.5 0C11.1458 0 10 0.875 9.5625 2.08333H5.20833C4.6558 2.08333 4.12589 2.30283 3.73519 2.69353C3.34449 3.08423 3.125 3.61413 3.125 4.16667V20.8333C3.125 21.3859 3.34449 21.9158 3.73519 22.3065C4.12589 22.6972 4.6558 22.9167 5.20833 22.9167H19.7917C20.3442 22.9167 20.8741 22.6972 21.2648 22.3065C21.6555 21.9158 21.875 21.3859 21.875 20.8333V4.16667C21.875 3.61413 21.6555 3.08423 21.2648 2.69353C20.8741 2.30283 20.3442 2.08333 19.7917 2.08333Z");
    			attr_dev(path1, "fill", "#578CFF");
    			add_location(path1, file$2, 42, 22, 3433);
    			attr_dev(g, "clip-path", "url(#clip0_17200_17)");
    			add_location(g, file$2, 41, 20, 3373);
    			attr_dev(rect, "width", "25");
    			attr_dev(rect, "height", "25");
    			attr_dev(rect, "fill", "white");
    			add_location(rect, file$2, 46, 24, 4544);
    			attr_dev(clipPath, "id", "clip0_17200_17");
    			add_location(clipPath, file$2, 45, 22, 4488);
    			add_location(defs1, file$2, 44, 20, 4458);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "25");
    			attr_dev(svg1, "height", "25");
    			attr_dev(svg1, "viewBox", "0 0 25 25");
    			attr_dev(svg1, "fill", "none");
    			add_location(svg1, file$2, 40, 16, 3256);
    			attr_dev(div1, "class", "copy svelte-yjaq5k");
    			add_location(div1, file$2, 39, 12, 3177);
    			attr_dev(div2, "class", "mb svelte-yjaq5k");
    			toggle_class(div2, "pressed", /*iban*/ ctx[0]);
    			add_location(div2, file$2, 37, 8, 3034);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "name", "");
    			attr_dev(input1, "id", "");
    			attr_dev(input1, "placeholder", "AMOUNT");
    			attr_dev(input1, "class", "svelte-yjaq5k");
    			add_location(input1, file$2, 53, 12, 4763);
    			attr_dev(div3, "class", "svelte-yjaq5k");
    			toggle_class(div3, "pressed", /*amount*/ ctx[1]);
    			add_location(div3, file$2, 52, 8, 4721);
    			add_location(article, file$2, 36, 4, 3015);
    			attr_dev(button0, "class", "reset svelte-yjaq5k");
    			add_location(button0, file$2, 57, 8, 4914);
    			attr_dev(button1, "class", "confirm svelte-yjaq5k");
    			add_location(button1, file$2, 58, 8, 4981);
    			attr_dev(div4, "class", "btn-container svelte-yjaq5k");
    			add_location(div4, file$2, 56, 4, 4877);
    			attr_dev(section, "class", "svelte-yjaq5k");
    			add_location(section, file$2, 21, 0, 521);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(div0, t2);
    			append_dev(div0, h2);
    			append_dev(section, t4);
    			append_dev(section, article);
    			append_dev(article, div2);
    			append_dev(div2, input0);
    			set_input_value(input0, /*iban*/ ctx[0]);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, g);
    			append_dev(g, path1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(article, t6);
    			append_dev(article, div3);
    			append_dev(div3, input1);
    			set_input_value(input1, /*amount*/ ctx[1]);
    			append_dev(section, t7);
    			append_dev(section, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t9);
    			append_dev(div4, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(div1, "click", /*pasteIban*/ ctx[4], false, false, false, false),
    					listen_dev(div1, "keydown", keydown_handler$1, false, false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(button0, "click", /*resetForm*/ ctx[2], false, false, false, false),
    					listen_dev(button1, "click", /*confirmTransfer*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iban*/ 1 && input0.value !== /*iban*/ ctx[0]) {
    				set_input_value(input0, /*iban*/ ctx[0]);
    			}

    			if (dirty & /*iban*/ 1) {
    				toggle_class(div2, "pressed", /*iban*/ ctx[0]);
    			}

    			if (dirty & /*amount*/ 2 && to_number(input1.value) !== /*amount*/ ctx[1]) {
    				set_input_value(input1, /*amount*/ ctx[1]);
    			}

    			if (dirty & /*amount*/ 2) {
    				toggle_class(div3, "pressed", /*amount*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler$1 = () => {
    	
    };

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Transfer', slots, []);
    	let iban;
    	let amount;

    	const resetForm = () => {
    		$$invalidate(1, amount = '');
    		$$invalidate(0, iban = '');
    	};

    	const confirmTransfer = () => {
    		let transferDetail = { amount, iban };
    		resetForm();
    		console.log(transferDetail);
    	};

    	const pasteIban = () => {
    		navigator.clipboard.readText().then(text => $$invalidate(0, iban = text));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Transfer> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		iban = this.value;
    		$$invalidate(0, iban);
    	}

    	function input1_input_handler() {
    		amount = to_number(this.value);
    		$$invalidate(1, amount);
    	}

    	$$self.$capture_state = () => ({
    		fade,
    		slide,
    		quintOut,
    		iban,
    		amount,
    		resetForm,
    		confirmTransfer,
    		pasteIban
    	});

    	$$self.$inject_state = $$props => {
    		if ('iban' in $$props) $$invalidate(0, iban = $$props.iban);
    		if ('amount' in $$props) $$invalidate(1, amount = $$props.amount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		iban,
    		amount,
    		resetForm,
    		confirmTransfer,
    		pasteIban,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Transfer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Transfer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\shared\Popup.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\components\\shared\\Popup.svelte";

    // (44:55) 
    function create_if_block_1$1(ctx) {
    	let p0;
    	let t0;
    	let t1_value = convertDate(/*$Detail*/ ctx[2].date) + "";
    	let t1;
    	let t2;
    	let h4;
    	let t3_value = /*$Detail*/ ctx[2].name + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5_value = (/*$Detail*/ ctx[2].type === 'debit' ? '- ' : '+ ') + "";
    	let t5;
    	let t6;
    	let t7_value = /*$Detail*/ ctx[2].amount + "";
    	let t7;
    	let t8;
    	let p1_class_value;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Date: ");
    			t1 = text(t1_value);
    			t2 = space();
    			h4 = element("h4");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			t7 = text(t7_value);
    			t8 = text(" USD");
    			attr_dev(p0, "class", "date svelte-1dh8j4w");
    			add_location(p0, file$1, 44, 20, 1584);
    			attr_dev(h4, "class", "name upper svelte-1dh8j4w");
    			add_location(h4, file$1, 45, 20, 1659);

    			attr_dev(p1, "class", p1_class_value = "amount " + (/*$Detail*/ ctx[2].type === 'debit'
    			? 'negative'
    			: 'positive') + " svelte-1dh8j4w");

    			add_location(p1, file$1, 46, 20, 1723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$Detail*/ 4 && t1_value !== (t1_value = convertDate(/*$Detail*/ ctx[2].date) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$Detail*/ 4 && t3_value !== (t3_value = /*$Detail*/ ctx[2].name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$Detail*/ 4 && t5_value !== (t5_value = (/*$Detail*/ ctx[2].type === 'debit' ? '- ' : '+ ') + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$Detail*/ 4 && t7_value !== (t7_value = /*$Detail*/ ctx[2].amount + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*$Detail*/ 4 && p1_class_value !== (p1_class_value = "amount " + (/*$Detail*/ ctx[2].type === 'debit'
    			? 'negative'
    			: 'positive') + " svelte-1dh8j4w")) {
    				attr_dev(p1, "class", p1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(44:55) ",
    		ctx
    	});

    	return block;
    }

    // (41:12) {#if $ActiveTab === 'your friends'}
    function create_if_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h4;
    	let t1_value = /*$Detail*/ ctx[2].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			if (!src_url_equal(img.src, img_src_value = /*$Detail*/ ctx[2].imageUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1dh8j4w");
    			add_location(img, file$1, 41, 21, 1404);
    			attr_dev(div, "class", "svelte-1dh8j4w");
    			add_location(div, file$1, 41, 16, 1399);
    			attr_dev(h4, "class", "name upper svelte-1dh8j4w");
    			add_location(h4, file$1, 42, 16, 1463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$Detail*/ 4 && !src_url_equal(img.src, img_src_value = /*$Detail*/ ctx[2].imageUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$Detail*/ 4 && t1_value !== (t1_value = /*$Detail*/ ctx[2].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:12) {#if $ActiveTab === 'your friends'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div6;
    	let div0;
    	let t0;
    	let section;
    	let p0;
    	let t1;
    	let div1;
    	let t2;
    	let article;
    	let div4;
    	let div2;
    	let p1;
    	let t4;
    	let p2;
    	let t5_value = /*$Detail*/ ctx[2].iban + "";
    	let t5;
    	let t6;
    	let div3;
    	let svg;
    	let g;
    	let path;
    	let defs;
    	let clipPath;
    	let rect;
    	let t7;
    	let div5;
    	let p3;
    	let t9;
    	let p4;
    	let t10_value = /*$Detail*/ ctx[2].info + "";
    	let t10;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$ActiveTab*/ ctx[3] === 'your friends') return create_if_block$1;
    		if (/*$ActiveTab*/ ctx[3] === 'your wallet') return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			t0 = space();
    			section = element("section");
    			p0 = element("p");
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			article = element("article");
    			div4 = element("div");
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "IBAN Number";
    			t4 = space();
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div3 = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			t7 = space();
    			div5 = element("div");
    			p3 = element("p");
    			p3.textContent = "Details";
    			t9 = space();
    			p4 = element("p");
    			t10 = text(t10_value);
    			attr_dev(div0, "class", "black-bg svelte-1dh8j4w");
    			toggle_class(div0, "change", /*opac*/ ctx[1]);
    			add_location(div0, file$1, 36, 4, 1185);
    			attr_dev(p0, "class", "dash svelte-1dh8j4w");
    			add_location(p0, file$1, 38, 8, 1275);
    			attr_dev(div1, "class", "upper-section svelte-1dh8j4w");
    			add_location(div1, file$1, 39, 8, 1305);
    			attr_dev(p1, "class", "title svelte-1dh8j4w");
    			add_location(p1, file$1, 53, 20, 2005);
    			attr_dev(p2, "class", "upper content svelte-1dh8j4w");
    			add_location(p2, file$1, 54, 20, 2059);
    			add_location(div2, file$1, 52, 16, 1978);
    			attr_dev(path, "d", "M19.7917 20.8333H5.20833V4.16667H7.29167V7.29167H17.7083V4.16667H19.7917M12.5 2.08333C12.7763 2.08333 13.0412 2.19308 13.2366 2.38843C13.4319 2.58378 13.5417 2.84873 13.5417 3.125C13.5417 3.40127 13.4319 3.66622 13.2366 3.86157C13.0412 4.05692 12.7763 4.16667 12.5 4.16667C12.2237 4.16667 11.9588 4.05692 11.7634 3.86157C11.5681 3.66622 11.4583 3.40127 11.4583 3.125C11.4583 2.84873 11.5681 2.58378 11.7634 2.38843C11.9588 2.19308 12.2237 2.08333 12.5 2.08333ZM19.7917 2.08333H15.4375C15 0.875 13.8542 0 12.5 0C11.1458 0 10 0.875 9.5625 2.08333H5.20833C4.6558 2.08333 4.12589 2.30283 3.73519 2.69353C3.34449 3.08423 3.125 3.61413 3.125 4.16667V20.8333C3.125 21.3859 3.34449 21.9158 3.73519 22.3065C4.12589 22.6972 4.6558 22.9167 5.20833 22.9167H19.7917C20.3442 22.9167 20.8741 22.6972 21.2648 22.3065C21.6555 21.9158 21.875 21.3859 21.875 20.8333V4.16667C21.875 3.61413 21.6555 3.08423 21.2648 2.69353C20.8741 2.30283 20.3442 2.08333 19.7917 2.08333Z");
    			attr_dev(path, "fill", "#578CFF");
    			add_location(path, file$1, 59, 26, 2411);
    			attr_dev(g, "clip-path", "url(#clip0_17200_17)");
    			add_location(g, file$1, 58, 24, 2347);
    			attr_dev(rect, "width", "25");
    			attr_dev(rect, "height", "25");
    			attr_dev(rect, "fill", "white");
    			add_location(rect, file$1, 63, 28, 3538);
    			attr_dev(clipPath, "id", "clip0_17200_17");
    			add_location(clipPath, file$1, 62, 26, 3478);
    			add_location(defs, file$1, 61, 24, 3444);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "25");
    			attr_dev(svg, "height", "25");
    			attr_dev(svg, "viewBox", "0 0 25 25");
    			attr_dev(svg, "fill", "none");
    			add_location(svg, file$1, 57, 20, 2226);
    			attr_dev(div3, "class", "copy svelte-1dh8j4w");
    			add_location(div3, file$1, 56, 16, 2144);
    			attr_dev(div4, "class", "iban svelte-1dh8j4w");
    			add_location(div4, file$1, 51, 12, 1942);
    			attr_dev(p3, "class", "title svelte-1dh8j4w");
    			add_location(p3, file$1, 70, 16, 3762);
    			attr_dev(p4, "class", "content svelte-1dh8j4w");
    			add_location(p4, file$1, 71, 16, 3808);
    			add_location(div5, file$1, 69, 12, 3739);
    			attr_dev(article, "class", "svelte-1dh8j4w");
    			add_location(article, file$1, 50, 8, 1919);
    			attr_dev(section, "class", "svelte-1dh8j4w");
    			toggle_class(section, "hide", /*pop*/ ctx[0]);
    			add_location(section, file$1, 37, 4, 1239);
    			attr_dev(div6, "class", "popup-cont svelte-1dh8j4w");
    			add_location(div6, file$1, 35, 0, 1108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div6, t0);
    			append_dev(div6, section);
    			append_dev(section, p0);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(section, t2);
    			append_dev(section, article);
    			append_dev(article, div4);
    			append_dev(div4, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t4);
    			append_dev(div2, p2);
    			append_dev(p2, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(article, t7);
    			append_dev(article, div5);
    			append_dev(div5, p3);
    			append_dev(div5, t9);
    			append_dev(div5, p4);
    			append_dev(p4, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", /*copyIban*/ ctx[5], false, false, false, false),
    					listen_dev(div3, "keydown", keydown_handler, false, false, false, false),
    					listen_dev(div6, "click", self(/*popInfo*/ ctx[4]), false, false, false, false),
    					listen_dev(div6, "keydown", keydown_handler_1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*opac*/ 2) {
    				toggle_class(div0, "change", /*opac*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}

    			if (dirty & /*$Detail*/ 4 && t5_value !== (t5_value = /*$Detail*/ ctx[2].iban + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$Detail*/ 4 && t10_value !== (t10_value = /*$Detail*/ ctx[2].info + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*pop*/ 1) {
    				toggle_class(section, "hide", /*pop*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function convertDate(d) {
    	const date = new Date(d); // Convert seconds to milliseconds
    	const day = date.getDate().toString().padStart(2, '0'); // Get day with leading zero
    	const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    	const year = date.getFullYear();
    	return `${day}.${month}.${year}`;
    }

    const keydown_handler = () => {
    	
    };

    const keydown_handler_1 = () => {
    	
    };

    function instance$1($$self, $$props, $$invalidate) {
    	let $Detail;
    	let $ActiveTab;
    	validate_store(Detail, 'Detail');
    	component_subscribe($$self, Detail, $$value => $$invalidate(2, $Detail = $$value));
    	validate_store(ActiveTab, 'ActiveTab');
    	component_subscribe($$self, ActiveTab, $$value => $$invalidate(3, $ActiveTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, []);
    	let pop = true;
    	let opac = true;

    	onMount(() => {
    		setTimeout(
    			() => {
    				$$invalidate(0, pop = false);
    				$$invalidate(1, opac = false);
    			},
    			200
    		);
    	});

    	const popInfo = () => {
    		$$invalidate(0, pop = true);
    		$$invalidate(1, opac = true);

    		setTimeout(
    			() => {
    				$$invalidate(0, pop = false);
    				$$invalidate(1, opac = false);
    				checkDetail.set(false);
    				Detail.set({});
    			},
    			200
    		);
    	};

    	const copyIban = () => {
    		navigator.clipboard.writeText($Detail.iban);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		checkDetail,
    		Detail,
    		ActiveTab,
    		onMount,
    		quintOut,
    		fade,
    		slide,
    		scale,
    		pop,
    		opac,
    		popInfo,
    		copyIban,
    		convertDate,
    		$Detail,
    		$ActiveTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('pop' in $$props) $$invalidate(0, pop = $$props.pop);
    		if ('opac' in $$props) $$invalidate(1, opac = $$props.opac);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pop, opac, $Detail, $ActiveTab, popInfo, copyIban];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    // (28:52) 
    function create_if_block_4(ctx) {
    	let transfer;
    	let current;
    	transfer = new Transfer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(transfer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(transfer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transfer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transfer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(transfer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(28:52) ",
    		ctx
    	});

    	return block;
    }

    // (26:54) 
    function create_if_block_3(ctx) {
    	let cards;
    	let current;
    	cards = new Cards({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cards.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cards, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cards.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cards.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cards, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(26:54) ",
    		ctx
    	});

    	return block;
    }

    // (24:57) 
    function create_if_block_2(ctx) {
    	let friends;
    	let current;
    	friends = new Friends({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(friends.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(friends, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(friends.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(friends.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(friends, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(24:57) ",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if $ActiveTab === 'your wallet'}
    function create_if_block_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(22:12) {#if $ActiveTab === 'your wallet'}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if $checkDetail}
    function create_if_block(ctx) {
    	let popup;
    	let current;
    	popup = new Popup({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(popup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(popup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(popup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:4) {#if $checkDetail}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let header;
    	let t0;
    	let section;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let menu;
    	let t2;
    	let current;
    	header = new Header({ $$inline: true });
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$ActiveTab*/ ctx[0] === 'your wallet') return 0;
    		if (/*$ActiveTab*/ ctx[0] === 'your friends') return 1;
    		if (/*$ActiveTab*/ ctx[0] === 'your cards') return 2;
    		if (/*$ActiveTab*/ ctx[0] === 'transfer') return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	menu = new Menu({ $$inline: true });
    	let if_block1 = /*$checkDetail*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(menu.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(section, "class", "svelte-1kdqbyy");
    			add_location(section, file, 20, 8, 767);
    			attr_dev(div, "class", "svelte-1kdqbyy");
    			add_location(div, file, 17, 4, 700);
    			attr_dev(main, "class", "app svelte-1kdqbyy");
    			add_location(main, file, 16, 0, 676);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(header, div, null);
    			append_dev(div, t0);
    			append_dev(div, section);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(section, null);
    			}

    			append_dev(div, t1);
    			mount_component(menu, div, null);
    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(section, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*$checkDetail*/ ctx[1]) {
    				if (if_block1) {
    					if (dirty & /*$checkDetail*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(menu);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $ActiveTab;
    	let $checkDetail;
    	validate_store(ActiveTab, 'ActiveTab');
    	component_subscribe($$self, ActiveTab, $$value => $$invalidate(0, $ActiveTab = $$value));
    	validate_store(checkDetail, 'checkDetail');
    	component_subscribe($$self, checkDetail, $$value => $$invalidate(1, $checkDetail = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ActiveTab,
    		checkDetail,
    		slide,
    		scale,
    		fade,
    		quintOut,
    		PhoneDetail,
    		Header,
    		Menu,
    		Home,
    		Friends,
    		Cards,
    		Transfer,
    		Popup,
    		$ActiveTab,
    		$checkDetail
    	});

    	return [$ActiveTab, $checkDetail];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.getElementById('app'),
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
