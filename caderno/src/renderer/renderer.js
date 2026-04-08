require.config({
  paths: {
    vs: './monaco/vs'
  }
})

require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(
    document.getElementById('container'),
    {
      value:
`// Monaco Editor funcionando 🎉
function hello() {
  console.log("Electron + Monaco!");
}
`,
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      wordWrap: 'on',
      minimap: { enabled: true }
    }
  )
})