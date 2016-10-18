
var state = {
  options: [],
  themes: [],
  theme: '',
  raw: false
}

var events = {
  changeOptions: (e) => {
    state.options[e.target.name] = !state.options[e.target.name]
    chrome.extension.sendMessage({
      message: 'options',
      options: state.options
    })
  },

  changeTheme: (e) => {
    state.theme = state.themes[e.target.selectedIndex]
    chrome.extension.sendMessage({
      message: 'theme',
      theme: state.theme
    })
  },

  viewRaw: () => {
    state.raw = !state.raw
    chrome.extension.sendMessage({
      message: 'raw',
      raw: state.raw,
      theme: state.theme
    })
  },

  setDefaults: () => {
    chrome.extension.sendMessage({
      message: 'defaults'
    }, (res) => {
      chrome.extension.sendMessage({message: 'settings'}, init)
    })
  },

  advancedOptions: () => {
    chrome.extension.sendMessage({message: 'advanced'})
  }
}

var description = {
  gfm: 'Enable GFM\n(GitHub Flavored Markdown)',
  tables: 'Enable GFM tables\n(requires the gfm option to be true)',
  breaks: 'Enable GFM line breaks\n(requires the gfm option to be true)',
  pedantic: 'Don\'t fix any of the original markdown\nbugs or poor behavior',
  sanitize: 'Ignore any HTML\nthat has been input',
  smartLists: 'Use smarter list behavior\nthan the original markdown',
  smartypants: 'Use "smart" typograhic punctuation\nfor things like quotes and dashes'
}

function init (res) {
  state.options = res.options
  state.theme = res.theme

  state.themes = chrome.runtime.getManifest().web_accessible_resources
    .filter((file) => (file.indexOf('/themes/') === 0))
    .map((file) => (file.replace(/\/themes\/(.*)\.css/, '$1')))

  state.raw = res.raw
  m.redraw()
}

function oncreate (vnode) {
  componentHandler.upgradeElements(vnode.dom)
}

chrome.extension.sendMessage({message: 'settings'}, init)

m.mount(document.querySelector('body'), {
  view: (vnode) =>
    m('#popup', [
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.viewRaw},
        (state.raw ? 'Html' : 'Markdown')),
      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.setDefaults},
        'Defaults'),

      m('h4', 'Theme'),
      m('select.mdl-shadow--2dp', {onchange: events.changeTheme}, state.themes.map((theme) =>
        m('option', {selected: state.theme === theme}, theme)
      )),

      m('h4', 'Compiler Options'),
      m('.mdl-grid', Object.keys(state.options).map((key, index) =>
        m('.mdl-cell',
          m('label.mdl-switch mdl-js-switch mdl-js-ripple-effect',
            {oncreate, title: description[key]}, [
            m('input[type="checkbox"].mdl-switch__input', {
              name: key,
              checked: state.options[key],
              onchange: events.changeOptions
            }),
            m('span.mdl-switch__label', key)
          ])
        )
      )),

      m('button.mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
        {oncreate, onclick: events.advancedOptions},
        'Advanced Options')
    ])
})