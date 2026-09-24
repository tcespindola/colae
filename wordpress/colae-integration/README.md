# COLAE Integration

Plugin inicial para integrar o configurador COLAE ao WordPress.

## Uso

1. Copie a pasta `colae-integration` para `wp-content/plugins/`.
2. Ative o plugin.
3. Use o shortcode:

```
[colae_quote]
```

A URL padrão do aplicativo é `https://app.colae.com.br`. Para outro endereço, defina `COLAE_APP_URL_OVERRIDE` antes de carregar o plugin.

O endpoint de saúde fica em `/wp-json/colae/v1/health`.
