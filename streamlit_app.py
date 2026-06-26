from __future__ import annotations

import base64
import re
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


APP_DIR = Path(__file__).parent


def data_uri(path: Path, mime_type: str) -> str:
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


@st.cache_data(show_spinner=False)
def build_game_html() -> str:
    html = (APP_DIR / "index.html").read_text(encoding="utf-8")
    css = (APP_DIR / "styles.css").read_text(encoding="utf-8")
    js = (APP_DIR / "game.js").read_text(encoding="utf-8")

    assets = {
        "assets/zukkoke-nuko.png?v=nuko-player-2": data_uri(APP_DIR / "assets" / "zukkoke-nuko.png", "image/png"),
        "assets/enemy-cat-sheet.png?v=enemy-cat-1": data_uri(APP_DIR / "assets" / "enemy-cat-sheet.png", "image/png"),
        "assets/whistle.mp3?v=whistle-1": data_uri(APP_DIR / "assets" / "whistle.mp3", "audio/mpeg"),
        "assets/8-bit-aggressive1.mp3?v=bgm-1": data_uri(APP_DIR / "assets" / "8-bit-aggressive1.mp3", "audio/mpeg"),
    }

    for source, embedded in assets.items():
        js = js.replace(source, embedded)

    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="styles\.css"\s*/>',
        lambda _: f"<style>\n{css}\n</style>",
        html,
    )
    html = re.sub(
        r'<script\s+src="game\.js[^"]*"></script>',
        lambda _: f"<script>\n{js}\n</script>",
        html,
    )
    return html


def main() -> None:
    st.set_page_config(
        page_title="ずっこけぬこサッカー",
        layout="wide",
    )

    st.markdown(
        """
        <style>
          .block-container {
            max-width: 1040px;
            padding: 1rem 1rem 0.5rem;
          }
          header, footer {
            visibility: hidden;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )

    components.html(build_game_html(), height=820, scrolling=False)


if __name__ == "__main__":
    main()
