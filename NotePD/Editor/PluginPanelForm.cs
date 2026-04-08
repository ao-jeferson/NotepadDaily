using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;
using NotePD.Models;
using NotePD.Plugins.Abstractions;
using NotePD.Services;

namespace NotePD.Forms
{
    public class PluginPanelForm : Form
    {
        private CheckedListBox list;
        private Button btnSave;

        // ✅ CONSTRUTOR CORRETO
        public PluginPanelForm(IEnumerable<IEditorPlugin> plugins)
        {
            Text = "Plugin Manager";
            Width = 400;
            Height = 300;
            StartPosition = FormStartPosition.CenterParent;

            list = new CheckedListBox();
            list.Dock = DockStyle.Fill;

            btnSave = new Button();
            btnSave.Text = "Salvar (reinicie o editor)";
            btnSave.Dock = DockStyle.Bottom;
            btnSave.Height = 35;
            btnSave.Click += Save_Click;

            LoadPlugins(plugins);

            Controls.Add(list);
            Controls.Add(btnSave);
        }

        private void LoadPlugins(IEnumerable<IEditorPlugin> plugins)
        {
            var states = PluginStateService.Load();

            foreach (var plugin in plugins)
            {
                bool enabled =
                    states.FirstOrDefault(p => p.Name == plugin.Name)?.Enabled ?? true;

                list.Items.Add(plugin.Name, enabled);
            }
        }

        private void Save_Click(object sender, EventArgs e)
        {
            List<PluginState> states = new List<PluginState>();

            for (int i = 0; i < list.Items.Count; i++)
            {
                states.Add(new PluginState
                {
                    Name = list.Items[i].ToString(),
                    Enabled = list.GetItemChecked(i)
                });
            }

            PluginStateService.Save(states);

            MessageBox.Show(
                "Configuração salva.\nReinicie o editor para aplicar os plugins.",
                "Plugins",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);

            Close();
        }
    }
}