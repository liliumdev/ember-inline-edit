import Ember from 'ember'
import layout from '../templates/components/ember-inline-edit'

const {
  Component,
  get,
  set,
  getProperties,
  computed,
  on,
  run,
  Logger,
  String: { htmlSafe },
  $
} = Ember

const {
  info
} = Logger

const clickIsInside = (element, target) => {
  return $(element).is($(target)) || $(element).has($(target)).length > 0
}

export default Component.extend({
  layout,
  classNames: ['ember-inline-edit'],
  classNameBindings: ['isEditing:is-editing', 'enabled::disabled'],

  isEditing: false,
  isNotEditing: computed.not('isEditing'),

  enabled: true,
  field: 'text',
  value: null,
  placeholder: 'Not Provided',
  saveLabel: 'Save',
  fieldWidth: null,
  originalValue: null,

  didInsertElement () {
    this._handleClick = this._handleClick.bind(this)
    this.set('originalValue', this.get('value'))

    $(document).on('click', this._handleClick)
  },

  willDestroyElement () {
    $(document).off('click', this._handleClick)
  },

  _handleClick (e) {
    let { isEditing, enabled } = getProperties(this, 'isEditing', 'enabled')

    /*
     * Don't care if it's not enabled
    */

    if (!enabled) return

    let clickedInside = clickIsInside(this.element, e.target)

    if (clickedInside && !isEditing) {
      /*
       * If there's an edit button, we want clicks on it to
       * toggle the editor, so we don't do anything here
      */

      if (get(this, 'showEditButton')) return

      //this._setFieldWidth()
      this.send('startEditing', e)

    } else if (!clickedInside && isEditing) {
      this.send('close')
    }
  },

  _setFieldWidth () {
    let editor = $(this.element)
    let width = htmlSafe(`width: ${(editor.width() + 2)}px`)

    run(this, () => set(this, 'fieldWidth', width))
  },

  didReceiveAttrs () {
    if (get(this, 'enabled') === false) {
      this.send('close')
    }
  },

  actions: {
    save () {
      info('[ember-inline-edit] Got the `onSave` action')
      this.set('originalValue', this.get('value'))
      this.sendAction('onSave', this.get('value'))

      run(this, () => {
        set(this, 'isEditing', false)
      })
    },

    startEditing (e) {
      info('[ember-inline-edit] Got the `startEditing` action')

      e.stopPropagation()

      run(this, () => {
        set(this, 'isEditing', true)
      })
    },

    close () {
      info('[ember-inline-edit] Got the `onClose` action')
      this.set('value', this.get('originalValue'))
      this.sendAction('onClose')

      run(this, () => {
        set(this, 'isEditing', false)
      })
    }
  }
})

