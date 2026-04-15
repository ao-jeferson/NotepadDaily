import subprocess
import tempfile
import os
from core.formatters.base import BaseFormatter


class CSharpFormatter(BaseFormatter):
    language = "C#"

    def format(self, text: str) -> str:
        """
        Formata código C# usando 'dotnet format'.

        Requisitos:
        - .NET SDK instalado
        - dotnet disponível no PATH

        Se 'dotnet format' não estiver disponível,
        retorna o texto original sem erro.
        """

        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                csproj_path = os.path.join(tmpdir, "Temp.csproj")
                cs_file_path = os.path.join(tmpdir, "Temp.cs")

                # 1️⃣ cria arquivo .csproj mínimo
                with open(csproj_path, "w", encoding="utf-8") as f:
                    f.write(
                        """<Project Sdk="Microsoft.NET.Sdk">
                          <PropertyGroup>
                            <TargetFramework>net8.0</TargetFramework>
                          </PropertyGroup>
                        </Project>"""
                    )

                # 2️⃣ cria arquivo .cs
                with open(cs_file_path, "w", encoding="utf-8") as f:
                    f.write(text)

                # 3️⃣ executa dotnet format
                subprocess.run(
                    ["dotnet", "format", csproj_path, "--no-restore"],
                    cwd=tmpdir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    check=True
                )

                # 4️⃣ lê código formatado
                with open(cs_file_path, "r", encoding="utf-8") as f:
                    return f.read()

        except Exception:
            # ✅ fallback seguro
            return text