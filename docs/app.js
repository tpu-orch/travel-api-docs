const documents = {
  'tickets-openapi': {
    type: 'openapi',
    title: 'Tickets API',
    label: 'Tickets OpenAPI',
    url: 'specs/openapi/PlaneTickets.yaml'
  },
  'hotels-openapi': {
    type: 'openapi',
    title: 'Hotels API',
    label: 'Hotels OpenAPI',
    url: 'specs/openapi/HotelBooking.yaml'
  },
  'tickets-asyncapi': {
    type: 'asyncapi',
    title: 'Tickets API - события',
    label: 'Tickets AsyncAPI',
    url: 'specs/asyncapi/PlaneTicketsAsync.yaml'
  },
  'hotels-asyncapi': {
    type: 'asyncapi',
    title: 'Hotels API - события',
    label: 'Hotels AsyncAPI',
    url: 'specs/asyncapi/HotelBookingAsync.yaml'
  }
};

const selector = document.getElementById('api-select');
const swaggerContainer = document.getElementById('swagger-ui');
const asyncapiContainer = document.getElementById('asyncapi-ui');
const status = document.getElementById('status');
const defaultDocumentId = Object.keys(documents)[0];

function populateDocumentSelector() {
  const groups = new Map();
  const groupLabels = { openapi: 'OpenAPI', asyncapi: 'AsyncAPI' };

  for (const [id, documentInfo] of Object.entries(documents)) {
    if (!groups.has(documentInfo.type)) {
      const group = document.createElement('optgroup');
      group.label = groupLabels[documentInfo.type] || documentInfo.type;
      groups.set(documentInfo.type, group);
      selector.append(group);
    }

    const option = document.createElement('option');
    option.value = id;
    option.textContent = documentInfo.label || documentInfo.title;
    groups.get(documentInfo.type).append(option);
  }
}

function selectedDocument() {
  const requested = new URLSearchParams(window.location.search).get('doc');
  return Object.hasOwn(documents, requested) ? requested : defaultDocumentId;
}

function showDocument(id, updateUrl = true) {
  const documentId = Object.hasOwn(documents, id) ? id : defaultDocumentId;
  const documentInfo = documents[documentId];

  selector.value = documentId;
  swaggerContainer.replaceChildren();
  asyncapiContainer.replaceChildren();
  status.hidden = true;
  document.title = `${documentInfo.title} | Travel API Documentation`;

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('doc', documentId);
    window.history.replaceState({}, '', url);
  }

  try {
    if (documentInfo.type === 'openapi') {
      SwaggerUIBundle({
        url: documentInfo.url,
        dom_id: '#swagger-ui',
        deepLinking: true
      });
    } else {
      AsyncApiStandalone.render({
        schema: { url: documentInfo.url },
        config: {
          show: { sidebar: true },
          expand: { messageExamples: true }
        }
      }, asyncapiContainer);
    }
  } catch (error) {
    status.textContent = `Не удалось открыть документацию: ${error.message}`;
    status.hidden = false;
  }
}

selector.addEventListener('change', () => showDocument(selector.value));

document.getElementById('share-button').addEventListener('click', async () => {
  const shareStatus = document.getElementById('share-status');
  const url = new URL(window.location.href);
  url.searchParams.set('doc', selector.value);

  try {
    await navigator.clipboard.writeText(url.toString());
    shareStatus.textContent = 'Ссылка скопирована';
  } catch {
    shareStatus.textContent = 'Скопируйте ссылку из адресной строки';
  }
});

populateDocumentSelector();
showDocument(selectedDocument(), false);
