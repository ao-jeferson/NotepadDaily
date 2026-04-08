require.config({ paths: { vs: './monaco/vs' } })

require(['vs/editor/editor.main'], function () {

  const editor = monaco.editor.create(
    document.getElementById('editor'),
    {
      theme: 'vs-dark',
      automaticLayout: true,
      language: 'javascript'
    }
  )

  const tabs = []
  let activeTab = null
  const tabsDiv = document.getElementById('tabs')

  function nowName () {
    return new Date().toLocaleString()
  }

  function renderTabs () {
    tabsDiv.innerHTML = ''
    tabs.forEach(tab => {
      const el = document.createElement('div')
      el.className = 'tab' + (tab === activeTab ? ' active' : '')
      el.textContent = tab.name
      el.onclick = () => activateTab(tab)
      tabsDiv.appendChild(el)
    })
  }

  function activateTab (tab) {
    activeTab = tab
    editor.setModel(tab.model)
    renderTabs()
  }

  function createTab (name, content, path) {
    const model = monaco.editor.createModel(content || '')
    const tab = {
      name: name || nowName(),
      model,
      path: path || null
    }
    tabs.push(tab)
    activateTab(tab)
  }

  // MENU EVENTS
  window.api.onNewTab(() => createTab())
  window.api.onOpen(async () => {
    const r = await window.api.openFile()
    if (!r) return
    createTab(r.path.split(/[\\/]/).pop(), r.content, r.path)
  })

  window.api.onSave(async () => {
    if (!activeTab) return
    const path = await window.api.saveFile({
      path: activeTab.path,
      content: activeTab.model.getValue()
    })
    if (path) {
      activeTab.path = path
      activeTab.name = path.split(/[\\/]/).pop()
      renderTabs()
    }
  })

  // ATALHOS LOCAIS (BACKUP)
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 't') { e.preventDefault(); createTab() }
    if (e.ctrlKey && e.key === 'o') { e.preventDefault(); window.api.openFile().then(r => r && createTab(r.path.split(/[\\/]/).pop(), r.content, r.path)) }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); activeTab && window.api.saveFile({ path: activeTab.path, content: activeTab.model.getValue() }) }
  })

  // ABA INICIAL
  createTab(null, '// Nova aba\n')
})