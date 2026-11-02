#!/usr/bin/env python3
"""
Pre-generates clean, professional base video templates for Editor X
"""

import os
from video_generator import render_video

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'media', 'generated')
os.makedirs(BASE_DIR, exist_ok=True)

videos = [
    {
        'title': 'O Ponto de Virada e Retencao',
        'topic': 'Analise de Estrategia',
        'script': 'Preste muita atencao neste detalhe especifico. Os dados mostram o exato momento de virada.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '9:16',
        'duration_seconds': 62,
        'output_path': os.path.join(BASE_DIR, 'short_1.mp4')
    },
    {
        'title': 'A Proposta Central e Teses',
        'topic': 'Fundamentacao Pratica',
        'script': 'Se analisarmos com clareza, o resultado e evidente. Cinco principios estruturais definem o avanco.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '9:16',
        'duration_seconds': 54,
        'output_path': os.path.join(BASE_DIR, 'short_2.mp4')
    },
    {
        'title': 'Metricas Decisivas e Conclusao',
        'topic': 'Sintese de Resultados',
        'script': 'A solucao se comprova em numeros reais. Concluimos com os direcionamentos para aplicacao imediata.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '9:16',
        'duration_seconds': 58,
        'output_path': os.path.join(BASE_DIR, 'short_3.mp4')
    },
    {
        'title': 'Modulo Completo de Fundamentos',
        'topic': 'Apresentacao Widescreen',
        'script': 'Nesta analise aprofundada em formato panoramico, exploramos as estruturas essenciais e normas aplicaveis.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '16:9',
        'duration_seconds': 74,
        'output_path': os.path.join(BASE_DIR, 'youtube_1.mp4')
    },
    {
        'title': 'Aprofundamento Pratico e Gestao',
        'topic': 'Masterclass Completa',
        'script': 'Passando para a execucao pratica, detalhamos cada parametro de gestao e dados oficiais consolidados.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '16:9',
        'duration_seconds': 174,
        'output_path': os.path.join(BASE_DIR, 'youtube_2.mp4')
    },
    {
        'title': 'Documentario Fatos Leis e Dados',
        'topic': 'Investigacao Narrativa',
        'script': 'Esta investigacao documental cruza dados oficiais com o ordenamento juridico brasileiro de forma assertiva.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '9:16',
        'duration_seconds': 74,
        'output_path': os.path.join(BASE_DIR, 'doc_short.mp4')
    },
    {
        'title': 'Demonstracao Tecnica e Software',
        'topic': 'Engenharia e Aplicativos',
        'script': 'Demonstracao tecnica com eliminacao de silencios e aceleracao em etapas repetitivas de modelagem.',
        'creator_handle': '@editorx.oficial',
        'color_hex': '#D4AF37',
        'aspect_ratio': '9:16',
        'duration_seconds': 62,
        'output_path': os.path.join(BASE_DIR, 'corp_short.mp4')
    }
]

for idx, v in enumerate(videos):
    print(f"[{idx+1}/{len(videos)}] Rendering {os.path.basename(v['output_path'])}...")
    res = render_video(v)
    print(f"Done: {res['output_path']} ({res['duration_seconds']}s, {res['file_size']} bytes)")

print("All base templates generated successfully!")
