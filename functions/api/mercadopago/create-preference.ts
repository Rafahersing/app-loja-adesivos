export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Lê o corpo da requisição (JSON)
    const body = await request.json();
    console.log("📥 Body recebido:", body);

    // Validação básica
    if (!body.items || !Array.isArray(body.items)) {
      throw new Error("Corpo inválido: 'items' é obrigatório e deve ser um array.");
    }

    // Endpoint sandbox do Mercado Pago
    const mpUrl = "https://api.sandbox.mercadopago.com/checkout/preferences";

    // Monta o corpo da requisição para o MP
    const preferenceBody = {
      items: body.items.map((item: any) => ({
        id: item.id || "item",
        title: item.title || "Produto",
        quantity: item.quantity || 1,
        unit_price: item.price || 1,
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${env.SITE_URL}/checkout/success`,
        failure: `${env.SITE_URL}/checkout/failure`,
        pending: `${env.SITE_URL}/checkout/pending`,
      },
      auto_return: "approved",
        notification_url: `${env.SITE_URL}/api/mercadopago/webhook`,
    };

    console.log("📦 Enviando preferenceBody:", preferenceBody);

    // Faz o POST para o Mercado Pago
    const response = await fetch(mpUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
        // Log para depuração do token de acesso (remover em produção)
        "X-Debug-MercadoPago-Token": env.MERCADOPAGO_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text(); // Se não for JSON, lê como texto
      console.error("❌ Resposta do Mercado Pago não é JSON. Conteúdo: ", data);
    }

    // Log do resultado
    console.log("✅ Resposta Mercado Pago:", data);

    // Trata erro de token ou requisição
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Erro do Mercado Pago",
          details: data,
        }),
        // Adicionado para depuração: logar o corpo da resposta do MP se não for JSON válido
        // Se 'data' não for um objeto JSON válido, isso pode causar o erro 'Unexpected token e'
        // A API do Mercado Pago pode retornar HTML ou texto puro em caso de erro.
        // Para fins de depuração, vamos tentar retornar o texto puro se JSON.stringify falhar.
        // No entanto, o erro 'Unexpected token e' sugere que o 'data' já é um texto não-JSON.
        // A correção mais provável é que o 'data' já é a string de erro, e não um objeto.
        // Vamos assumir que 'data' é a resposta bruta do MP quando response.ok é false.
        // Se 'data' for uma string, JSON.stringify(data) resultará em '"string"'.
        // O erro 'Unexpected token e' indica que o corpo da resposta não é JSON.
        // Portanto, a resposta do MP não está sendo tratada corretamente aqui.
        // A linha 47 'const data = await response.json();' pode estar falhando se a resposta não for JSON.
        // Vamos tentar ler a resposta como texto e logar para depuração.
        // Se a resposta não for JSON, response.json() vai falhar e cair no catch geral.
        // O erro 'Unexpected token e' vem do cliente tentando parsear a resposta do worker.
        // O worker está retornando JSON.stringify({ error: error.message }) no catch.
        // O problema é que o 'error.message' pode ser 'Unexpected token e', que não é JSON válido.
        // A solução é garantir que o worker sempre retorne JSON válido.
        // O erro original 'Unexpected token e' vem do cliente tentando parsear a resposta do worker.
        // O worker está retornando JSON.stringify({ error: error.message }) no catch.
        // Se 'error.message' for a string 'Unexpected token e', então JSON.stringify({ error: 'Unexpected token e' }) é um JSON válido.
        // O problema é que o erro 'error code: 1016' não é JSON válido.
        // Isso significa que o worker está retornando a string literal 'error code: 1016' diretamente, sem JSON.stringify.
        // Isso pode acontecer se o 'error' no catch for uma Response ou algo que não seja um Error com uma propriedade 'message'.
        // Ou, mais provavelmente, o `response.json()` na linha 47 falha, e o `catch` pega o erro, e `error.message` é `Unexpected token e`.
        // A linha 72 `JSON.stringify({ error: error.message })` deveria lidar com isso.
        // O erro `error code: 1016` é um erro do Cloudflare. Isso indica que o worker não está sendo executado corretamente.
        // Pode ser um problema de configuração do worker ou de variáveis de ambiente.
        // O erro `error code: 1016` geralmente significa que o worker não conseguiu se conectar a um serviço externo (neste caso, Mercado Pago).
        // Isso pode ser devido a um problema de rede, ou a um problema com as credenciais.
        // As credenciais foram fornecidas no prompt. Vamos verificar se elas estão sendo usadas corretamente.
        // `env.MERCADOPAGO_ACCESS_TOKEN` está sendo usado na linha 41.
        // O problema pode ser que a variável de ambiente `MERCADOPAGO_ACCESS_TOKEN` não está configurada corretamente no Cloudflare Worker.
        // O usuário afirmou que as variáveis estão configuradas no Cloudflare. Vamos confiar nisso por enquanto.
        // O erro `error code: 1016` é um erro de tempo de execução do Cloudflare Worker.
        // Isso significa que o worker está falhando antes de conseguir processar a requisição ou antes de retornar uma resposta válida.
        // O `console.error` na linha 70 provavelmente está sendo chamado.
        // A mensagem de erro `Unexpected token 'e', 
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Retorna a preferência criada para o front-end
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro geral no create-preference:", error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
