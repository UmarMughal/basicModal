window.basicModal = {

	THEME: {
		small: 'basicModal__small',
		xclose: 'basicModal__xclose'
	},

	_lastFocus: null,

	_dom(elem = '', multiple = false) {

		if (multiple===true)	return document.querySelectorAll('.basicModal ' + elem)
		else					return document.querySelector('.basicModal ' + elem)

	},

	_valid(data = {}) {

		if (data.body==null)		data.body = ''
		if (data.class==null)		data.class = ''
		if (data.closable!==false)	data.closable = true

		// Validate action-button
		if (data.buttons.action!=null) {

			if (data.buttons.action.class==null) data.buttons.action.class = ''
			if (data.buttons.action.title==null) data.buttons.action.title = 'OK'

		}

		// Validate cancel-button
		if (data.buttons.cancel!=null) {

			if (data.buttons.cancel.class==null) data.buttons.cancel.class = ''
			if (data.buttons.cancel.title==null) data.buttons.cancel.title = 'Cancel'

		}

		return true

	},

	_build(data) {

		var icon = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M405 136.798l-29.798-29.798-119.202 119.202-119.202-119.202-29.798 29.798 119.202 119.202-119.202 119.202 29.798 29.798 119.202-119.202 119.202 119.202 29.798-29.798-119.202-119.202z"/></svg>',
			html = ''

		html +=	`
				<div class='basicModalContainer basicModalContainer--fadeIn' data-closable='${ data.closable }'>
					<div class='basicModal basicModal--fadeIn ${ data.class }' role="dialog">
						<div class='basicModal__content'>
							${ data.body }
						</div>
						<div class='basicModal__buttons'>
				`

		// Cancel-button
		if (data.buttons.cancel!=null) {
			if (data.buttons.cancel.class.indexOf('basicModal__xclose')===-1) {

				// Default close-button
				html +=	`<a id='basicModal__cancel' class='basicModal__button ${ data.buttons.cancel.class }'>${ data.buttons.cancel.title }</a>`

			} else {

				// Custom close-button for the login-theme
				html += `<div id='basicModal__cancel' class='basicModal__button ${ data.buttons.cancel.class }' aria-label='close'>${ icon }</div>`

			}
		}

		// Action-button
		if (data.buttons.action!=null) {

			html += `<a id='basicModal__action' class='basicModal__button ${ data.buttons.action.class }'>${ data.buttons.action.title }</a>`

		}

		html +=	`
						</div>
					</div>
				</div>
				`

		return html

	},

	getValues() {

		var values = null,
			inputs = basicModal._dom('input', true)

		if (inputs.length>0) {

			values = {}

			// Get value from all inputs
			for (let i = 0; i < inputs.length; ++i) {

				let input	= inputs[i],
					name	= input.getAttribute('name'),
					value	= input.value

				// Store name and value of input
				if (name!=null) values[name] = value

			}

			// Set value back to null when object empty
			if (Object.keys(values).length===0) values = null

		}

		return values

	},

	_bind(data) {

		// Cancel-button
		if (data.buttons.cancel!=null) {

			basicModal._dom('#basicModal__cancel').onclick = function() {

				// Don't execute function when button has been clicked already
				if (this.classList.contains('basicModal__button--active')===true) return false

				this.classList.add('basicModal__button--active')
				data.buttons.cancel.fn()

			}

		}

		// Action-button
		if (data.buttons.action!=null) {

			basicModal._dom('#basicModal__action').onclick = function() {

				// Don't execute function when button has been clicked already
				if (this.classList.contains('basicModal__button--active')===true) return false

				this.classList.add('basicModal__button--active')
				data.buttons.action.fn(basicModal.getValues())

			}

		}

		// Bind input
		var inputs = basicModal._dom('input', true)
		for (let i = 0; i < inputs.length; ++i) { inputs[i].keydown = function() { this.classList.remove('error') } }

		return true

	},

	show(data) {

		if (data==null||Object.keys(data).length===0) return false

		// Save focused element
		basicModal._lastFocus = document.activeElement

		// Validate data end set default values
		basicModal._valid(data)

		// Close open modal
		if (basicModal._dom()!=null) {
			basicModal.close(true)
			setTimeout(() => basicModal.show(data), 301)
			return false
		}

		// Build and append modal to DOM
		var html = basicModal._build(data)
		document.body.insertAdjacentHTML('beforeend', html)

		// Bind elements
		basicModal._bind(data)

		// Select the first input when available
		var input = basicModal._dom('input')
		if (input!=null) input.select()

		// Execute callback when available
		if (data.callback!=null) data.callback(data)

		return true

	},

	error(input) {

		// Reactive buttons and remove old errors
		basicModal.reset()

		var elem = basicModal._dom(`input[name='${ input }']`)

		elem.classList.add('error')
		elem.select()

		// Shake input
		basicModal._dom().classList.remove('basicModal--fadeIn', 'basicModal--shake')
		setTimeout(() => basicModal._dom().classList.add('basicModal--shake'), 1)

	},

	visible() {

		if (basicModal._dom()!=null) return true
		return false

	},

	action() {

		var elem = basicModal._dom('#basicModal__action')

		if (elem!=null) {

			elem.click()
			return true

		}

		return false

	},

	cancel() {

		var elem = basicModal._dom('#basicModal__cancel')

		if (elem!=null) {

			elem.click()
			return true

		}

		return false

	},

	reset() {

		// Reactive buttons
		var buttons = basicModal._dom('.basicModal__button', true)
		for (let i = 0; i < buttons.length; ++i) { buttons[i].classList.remove('basicModal__button--active') }

		// Remove errors
		var inputs = basicModal._dom('input', true)
		for (let i = 0; i < inputs.length; ++i) { inputs[i].classList.remove('error') }

		return true

	},

	close(force) {

		// Only close when a modal is visible
		if (basicModal.visible()===false) return false

		// Validate force
		if (force!==true) force = false

		// Get modal container
		var container = basicModal._dom().parentElement

		// Don't close when modal not closable
		// Use 'force===true' to close unclosebale modal
		if (container.getAttribute('data-closable')==='false'&&force===false) return false

		container.classList.remove('basicModalContainer--fadeIn')
		container.classList.add('basicModalContainer--fadeOut')

		setTimeout(() => container.remove(), 300)

		// Restore last active element
		if (basicModal._lastFocus!=null) {
			basicModal._lastFocus.focus()
			basicModal._lastFocus = null
		}

		return true

	}

}