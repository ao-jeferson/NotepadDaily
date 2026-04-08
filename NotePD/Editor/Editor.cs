using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Domain;
using Editor;
using NotePD.Editor;
using NotePD.Forms;
using NotePD.Models;
using NotePD.Services;
using ScintillaNET;

namespace NotePD
{
    public class Form1 : Form
    {
        private MenuStrip menu;
        private TabControl tabControl;
        private ContextMenuStrip tabContextMenu;
        //private int hoveredTabIndex = -1;

        private StatusStrip status;
        private ToolStripStatusLabel positionLabel;
        private ToolStripStatusLabel languageLabel;
        private UserSettings settings;


        public Form1()
        {
            Text = "NotePD";
            Width = 1200;
            Height = 800;
            StartPosition = FormStartPosition.CenterScreen;

            KeyPreview = true;
            KeyDown += Form1_KeyDown;

            InitializeLayout();
            InitializeTabContextMenu();
            this.FormClosing += Form1_FormClosing;
            settings = SettingsService.Load();
            RestoreSession();
            KeyPreview = true;
            KeyDown += Form1_KeyDown;


        }
        private void InitializeLayout()
        {
            SuspendLayout();

            // ===== MENU =====
            menu = new MenuStrip();
            menu.Dock = DockStyle.Top;

          
            //commonMenu();
          
            MainMenuStrip = menu;

            // ===== TAB CONTROL =====
            tabControl = new TabControl();
            tabControl.Dock = DockStyle.Fill;
            tabControl.DrawMode = System.Windows.Forms.TabDrawMode.OwnerDrawFixed;
            tabControl.Padding = new Point(22, 4);
            //---Menus

            MenuFile();
            MenuEditar();
            MenuLanguage();
            MenuPlugins();
           
            Controls.Add(tabControl);


            tabControl.BringToFront();
            tabControl.DrawItem += TabControl_DrawItem;
            tabControl.MouseDown += TabControl_MouseDown;
            tabControl.MouseUp += TabControl_MouseUp;
           
         
            ResumeLayout(true);


            status = new StatusStrip();

            positionLabel = new ToolStripStatusLabel("Ln 1, Col 1");
            languageLabel = new ToolStripStatusLabel("Text");

            status.Items.Add(positionLabel);
            status.Items.Add(new ToolStripStatusLabel("|"));
            status.Items.Add(languageLabel);

            Controls.Add(status);
            status.Dock = DockStyle.Bottom;


            SplitContainer split = new SplitContainer();
            split.Dock = DockStyle.Fill;
            split.Orientation = Orientation.Vertical;

            split.Panel1.Controls.Add(new Control());
            split.Panel2.Controls.Add(new Control());

            Controls.Add(split);

        }

        private void MenuFile()
        {
            ToolStripMenuItem fileMenu = new ToolStripMenuItem("File");

            ToolStripMenuItem newItem =
                new ToolStripMenuItem("New", null, NewFile_Click);
            newItem.ShortcutKeys = Keys.Control | Keys.N;

            ToolStripMenuItem openItem =
                new ToolStripMenuItem("Open", null, OpenFile_Click);
            openItem.ShortcutKeys = Keys.Control | Keys.O;

            ToolStripMenuItem saveItem =
                new ToolStripMenuItem("Save", null, SaveFile_Click);
            saveItem.ShortcutKeys = Keys.Control | Keys.S;

            fileMenu.DropDownItems.Add(newItem);
            fileMenu.DropDownItems.Add(openItem);
            fileMenu.DropDownItems.Add(saveItem);
            menu.Items.Add(fileMenu);
            Controls.Add(menu);
        }

        private void MenuEditar()
        {

            ToolStripMenuItem editMenu = new ToolStripMenuItem("Edit");

            ToolStripMenuItem wordWrapItem = new ToolStripMenuItem("Word Wrap");
            wordWrapItem.CheckOnClick = true;
            wordWrapItem.Checked = false;

            wordWrapItem.Click += WordWrap_Click;

            editMenu.DropDownItems.Add(wordWrapItem);

            // Se já existir menu Edit, só adicione o item
            menu.Items.Add(editMenu);

        }

        private void WordWrap_Click(object sender, EventArgs e)
        {
            ToolStripMenuItem item = sender as ToolStripMenuItem;
            if (item == null)
                return;

            EditorTab tab = GetCurrentTab();
            if (tab == null)
                return;

            tab.SetWordWrap(item.Checked);
        }

        //private void commonMenu() {
        //    var editMenu = new ToolStripMenuItem("Edit");
        //    editMenu.DropDownItems.Add("Undo", null, (s, e) => editor.Undo());
        //    editMenu.DropDownItems.Add("Redo", null, (s, e) => editor.Redo());
        //    editMenu.DropDownItems.Add("Select All", null, (s, e) => editor.SelectAll());

        //    var searchMenu = new ToolStripMenuItem("Search");
        //    searchMenu.DropDownItems.Add("Find", null, OpenFind);
        //    searchMenu.DropDownItems.Add("Replace", null, OpenReplace);

        //    var pluginsMenu = new ToolStripMenuItem("Plugins");
        //    pluginsMenu.DropDownItems.Add("Plugin Manager", null,
        //        (s, e) => new PluginPanel(plugins).Show());
        //}

        private void MenuPlugins()
        {

            ToolStripMenuItem pluginsMenu = new ToolStripMenuItem("Plugins");

            pluginsMenu.DropDownItems.Add(
                new ToolStripMenuItem(
                    "Plugin Manager",
                    null,
                    (s, e) =>
                    {
                        new PluginPanelForm(PluginLoader.LoadPlugins(null)).ShowDialog(this);
                    }));

            menu.Items.Add(pluginsMenu);

        }



        private void ApplyLanguage(EditorTab tab, Language language)
        {
            tab.CurrentLanguage = language;

            switch (language)
            {
                case Language.CSharp:
                    SyntaxHighlightService.ApplyCSharp(tab.Editor);
                    languageLabel.Text = "C#";
                    break;

                case Language.JavaScript:
                    SyntaxHighlightService.ApplyJavaScript(tab.Editor);
                    languageLabel.Text = "JavaScript";
                    break;

                case Language.Sql:
                    SyntaxHighlightService.ApplySql(tab.Editor);
                    languageLabel.Text = "SQL";
                    break;

                default:
                    SyntaxHighlightService.ApplyPlainText(tab.Editor);
                    languageLabel.Text = "Text";
                    break;
            }
        }


        private void Tab_CursorPositionChanged(object sender, EventArgs e)
        {
            EditorTab tab = GetCurrentTab();
            if (tab == null) return;

            int pos = tab.Editor.CurrentPosition;
            int line = tab.Editor.LineFromPosition(pos) + 1;
            int col = pos - tab.Editor.Lines[line - 1].Position + 1;

            positionLabel.Text = "Ln " + line + ", Col " + col;
        }

        // =====================================================
        // CONTEXT MENU
        // =====================================================
        private void InitializeTabContextMenu()
        {
            tabContextMenu = new ContextMenuStrip();

            ToolStripMenuItem closeItem =
                new ToolStripMenuItem("Fechar aba", null, CloseCurrentTab);

            tabContextMenu.Items.Add(closeItem);
        }

        // =====================================================
        // ABAS
        // =====================================================
        private EditorTab GetCurrentTab()
        {
            if (tabControl.SelectedTab is EditorTab)
                return (EditorTab)tabControl.SelectedTab;

            return null;
        }

        private void CreateNewTab(string content = null, string path = null)
        {
            string title = DateTime.Now.ToString("dd-MM HH:mm");
            EditorTab tab = new EditorTab(title);
            tab.CursorPositionChanged += Tab_CursorPositionChanged;
            if (content != null)
                tab.Editor.Text = content;

            if (path != null)
            {
                tab.FilePath = path;
                tab.Text = Path.GetFileName(path);
            }

            tabControl.TabPages.Add(tab);
            tabControl.SelectedTab = tab;

            tab.Editor.Styles[Style.Default].Font = settings.FontName;
            tab.Editor.Styles[Style.Default].Size = settings.FontSize;
            tab.Editor.UseTabs = settings.UseTabs;

        }

        private void CloseTab(int index)
        {
            if (index >= 0 && index < tabControl.TabPages.Count)
            {
                TabPage tab = tabControl.TabPages[index];
                tabControl.TabPages.RemoveAt(index);
                tab.Dispose();
            }
        }

        // =====================================================
        // MENU EVENTS
        // =====================================================
        private void NewFile_Click(object sender, EventArgs e)
        {
            CreateNewTab();
        }

        private void OpenFile_Click(object sender, EventArgs e)
        {

            Tuple<string, string> result = FileService.Open();
            if (result == null)
                return;

            CreateNewTab(result.Item2, result.Item1);

            EditorTab tab = GetCurrentTab();
            if (tab == null)
                return;

            Language lang =
                LanguageDetectionService.DetectFromFile(tab.FilePath);

            ApplyLanguage(tab, lang);


        }

        private void Form1_KeyDown(object sender, KeyEventArgs e)
        {
            EditorTab tab = GetCurrentTab();
            if (tab == null)
                return;

            Scintilla editor = tab.Editor;



            /// ===== NOVA ABA =====
            if (e.Control && e.KeyCode == Keys.N)
            {
                CreateNewTab();
                e.SuppressKeyPress = true;
                return;
            }


            // ========== EDIÇÃO ==========
            if (e.Control && e.KeyCode == Keys.A)
            {
                editor.SelectAll();
                e.SuppressKeyPress = true;
            }
            else if (e.Control && e.KeyCode == Keys.Z)
            {
                editor.Undo();
                e.SuppressKeyPress = true;
            }
            else if (e.Control && e.KeyCode == Keys.Y)
            {
                editor.Redo();
                e.SuppressKeyPress = true;
            }
            else if (e.Control && e.KeyCode == Keys.W)
            {
                CloseCurrentTab(null, null);
                e.SuppressKeyPress = true;
            }

            // ========== NAVEGAÇÃO ENTRE ABAS ==========
            else if (e.Control && e.KeyCode == Keys.Tab)
            {
                int index = tabControl.SelectedIndex + 1;
                if (index >= tabControl.TabPages.Count)
                    index = 0;

                tabControl.SelectedIndex = index;
                e.SuppressKeyPress = true;
            }
            else if (e.Control && e.Shift && e.KeyCode == Keys.Tab)
            {
                int index = tabControl.SelectedIndex - 1;
                if (index < 0)
                    index = tabControl.TabPages.Count - 1;

                tabControl.SelectedIndex = index;
                e.SuppressKeyPress = true;
            }

            
        }


        private void SaveFile_Click(object sender, EventArgs e)
        {
            EditorTab tab = GetCurrentTab();
            if (tab == null)
                return;


            if (string.IsNullOrEmpty(tab.FilePath))
            {
                string path = FileService.SaveAs(tab.Editor.Text);
                if (path != null)
                {
                    tab.FilePath = path;
                    tab.Text = Path.GetFileName(path);

                    Language lang =
                        LanguageDetectionService.DetectFromFile(path);

                    ApplyLanguage(tab, lang);
                }
            }

            else
            {
                FileService.Save(tab.FilePath, tab.Editor.Text);
            }
        }

        // =====================================================
        // TAB DRAW + CLICK
        // =====================================================
        private void TabControl_DrawItem(object sender, DrawItemEventArgs e)
        {
            TabPage tab = tabControl.TabPages[e.Index];
            Rectangle tabRect = tabControl.GetTabRect(e.Index);

            // Fundo
            e.Graphics.FillRectangle(
                e.Index == tabControl.SelectedIndex
                    ? Brushes.White
                    : Brushes.LightGray,
                tabRect);

            // Texto
            TextRenderer.DrawText(
                e.Graphics,
                tab.Text,
                Font,
                tabRect,
                Color.Black,
                TextFormatFlags.Left | TextFormatFlags.VerticalCenter);

            // Botão X
            Rectangle closeButton = GetCloseButtonRect(tabRect);

            TextRenderer.DrawText(
                e.Graphics,
                "x",
                Font,
                closeButton,
                Color.Black,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
        }

        private void TabControl_MouseDown(object sender, MouseEventArgs e)
        {
            for (int i = 0; i < tabControl.TabPages.Count; i++)
            {
                Rectangle tabRect = tabControl.GetTabRect(i);
                Rectangle closeButton = GetCloseButtonRect(tabRect);

                if (closeButton.Contains(e.Location))
                {
                    CloseTab(i);
                    return;
                }
            }
        }

        private void TabControl_MouseUp(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Right)
            {
                for (int i = 0; i < tabControl.TabPages.Count; i++)
                {
                    if (tabControl.GetTabRect(i).Contains(e.Location))
                    {
                        tabControl.SelectedIndex = i;
                        tabContextMenu.Show(tabControl, e.Location);
                        return;
                    }
                }
            }
        }

        private void CloseCurrentTab(object sender, EventArgs e)
        {
            CloseTab(tabControl.SelectedIndex);
        }

        private Rectangle GetCloseButtonRect(Rectangle tabRect)
        {
            return new Rectangle(
                tabRect.Right - 18,
                tabRect.Top - 0,
                14,
                14);
        }


        void SetLanguage(Language language)
        {
            EditorTab tab = GetCurrentTab();
            if (tab == null)
                return;

            switch (language)
            {
                case Language.CSharp:
                    SyntaxHighlightService.ApplyCSharp(tab.Editor);
                    break;

                case Language.JavaScript:
                    SyntaxHighlightService.ApplyJavaScript(tab.Editor);
                    break;

                case Language.Sql:
                    SyntaxHighlightService.ApplySql(tab.Editor);
                    break;

                default:
                    SyntaxHighlightService.ApplyPlainText(tab.Editor);
                    break;
            }
        }


        private void MenuLanguage()
        {
            ToolStripMenuItem languageMenu = new ToolStripMenuItem("Language");

            ToolStripMenuItem csItem =
                new ToolStripMenuItem("C#", null,
                    delegate { SetLanguage(Language.CSharp); });

            ToolStripMenuItem jsItem =
                new ToolStripMenuItem("JavaScript", null,
                    delegate { SetLanguage(Language.JavaScript); });

            ToolStripMenuItem sqlItem =
                new ToolStripMenuItem("SQL", null,
                    delegate { SetLanguage(Language.Sql); });

            ToolStripMenuItem textItem =
                new ToolStripMenuItem("Text", null,
                    delegate { SetLanguage(Language.Text); });

            languageMenu.DropDownItems.Add(csItem);
            languageMenu.DropDownItems.Add(jsItem);
            languageMenu.DropDownItems.Add(sqlItem);
            languageMenu.DropDownItems.Add(textItem);

            menu.Items.Add(languageMenu);
        }

        private void RestoreSession()
        {
            SessionState session = SessionService.Load();

            if (session == null || session.Tabs.Count == 0)
            {
                CreateNewTab();
                return;
            }

            foreach (var tabInfo in session.Tabs)
            {
                if (File.Exists(tabInfo.FilePath))
                {
                    string content = File.ReadAllText(tabInfo.FilePath);

                    EditorTab tab = new EditorTab(tabInfo.TabTitle);
                    tab.FilePath = tabInfo.IsTemporary ? null : tabInfo.FilePath;
                    tab.Editor.Text = content;

                    tabControl.TabPages.Add(tab);

                    // Aplica highlight automático se for arquivo real
                    if (!tabInfo.IsTemporary && tab.FilePath != null)
                        SyntaxHighlightService.ApplyByFileExtension(tab.Editor, tab.FilePath);
                }
            }

            if (session.ActiveTabIndex >= 0 &&
                session.ActiveTabIndex < tabControl.TabPages.Count)
            {
                tabControl.SelectedIndex = session.ActiveTabIndex;
            }
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            SessionState session = new SessionState();

            string appFolder = Application.StartupPath;
            string tempFolder = Path.Combine(appFolder, "_temp");

            if (!Directory.Exists(tempFolder))
                Directory.CreateDirectory(tempFolder);

            foreach (TabPage page in tabControl.TabPages)
            {
                EditorTab tab = page as EditorTab;
                if (tab == null)
                    continue;

                try
                {
                    string finalPath;
                    bool isTemp = false;

                    // ============================
                    // ARQUIVO REAL
                    // ============================
                    if (!string.IsNullOrEmpty(tab.FilePath) && File.Exists(tab.FilePath))
                    {
                        string fileName = Path.GetFileName(tab.FilePath);
                        string destPath = Path.Combine(appFolder, fileName);

                        if (!File.Exists(destPath))
                            File.Copy(tab.FilePath, destPath);

                        finalPath = destPath;
                    }
                    // ============================
                    // ARQUIVO TEMPORÁRIO
                    // ============================
                    else
                    {
                        string tempFileName =
                            "unsaved_" + Guid.NewGuid().ToString("N") + ".txt";

                        finalPath = Path.Combine(tempFolder, tempFileName);

                        File.WriteAllText(finalPath, tab.Editor.Text);

                        File.SetAttributes(
                            finalPath,
                            File.GetAttributes(finalPath) | FileAttributes.Hidden);

                        isTemp = true;
                    }

                    session.Tabs.Add(new SessionTabInfo
                    {
                        FilePath = finalPath,
                        TabTitle = tab.Text,        // ✅ GUARDA O NOME DA ABA
                        IsTemporary = isTemp
                    });
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        "Erro ao salvar sessão:\n" + ex.Message,
                        "Erro",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error);
                }
            }

            session.ActiveTabIndex = tabControl.SelectedIndex;
            SessionService.Save(session);
        }
    }
}