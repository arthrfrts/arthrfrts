# Filtros em português para datas, notas e URLs.
# (O Liquid não tem nomes de meses em pt-BR, e o Cloudflare Pages roda
# plugins normalmente, ao contrário do GitHub Pages.)
require "time"
require "uri"

module ArthrMe
  module Filtros
    MESES = %w[janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro].freeze
    MESES_CURTOS = %w[jan. fev. mar. abr. mai. jun. jul. ago. set. out. nov. dez.].freeze

    # "2026-09-22T10:00:00-03:00" → "22 de set."
    # Datas sem hora ("2026-09-22", como o watchedDate do Letterboxd) não
    # passam por fuso, então não viram o dia anterior.
    def data_curta(valor)
      t = para_tempo(valor)
      t ? "#{t.day} de #{MESES_CURTOS[t.month - 1]}" : ""
    end

    # → "24 de setembro de 2026 às 15:29"
    def data_completa(valor)
      t = para_tempo(valor)
      t ? format("%d de %s de %d às %02d:%02d", t.day, MESES[t.month - 1], t.year, t.hour, t.min) : ""
    end

    # → "24 de set., 14:02"
    def data_hora(valor)
      t = para_tempo(valor)
      t ? format("%d de %s, %02d:%02d", t.day, MESES_CURTOS[t.month - 1], t.hour, t.min) : ""
    end

    # 3.5 → "★★★½"
    def estrelas(nota)
      n = nota.to_f
      ("★" * n.floor) + (n % 1 >= 0.5 ? "½" : "")
    end

    # 3.5 → "3,5"; 5.0 → "5"
    def nota_por_extenso(nota)
      n = nota.to_f
      (n % 1).zero? ? n.to_i.to_s : n.to_s.tr(".", ",")
    end

    # "https://www.example.com/a" → "example.com"
    def host(url)
      URI.parse(url.to_s).host.to_s.sub(/\Awww\./, "")
    rescue URI::InvalidURIError
      url
    end

    private

    def para_tempo(valor)
      return nil if valor.nil? || valor.to_s.empty?
      return valor.getlocal if valor.is_a?(Time)
      return Date.parse(valor) if valor.to_s.match?(/\A\d{4}-\d{2}-\d{2}\z/)

      Time.parse(valor.to_s).getlocal
    rescue ArgumentError
      nil
    end
  end
end

Liquid::Template.register_filter(ArthrMe::Filtros)
