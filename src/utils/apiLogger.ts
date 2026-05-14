interface LogStyle {
  request: string;
  response: string;
  error: string;
}

const logStyles: LogStyle = {
  request: 'color: #2563eb; font-weight: bold;',
  response: 'color: #059669; font-weight: bold;',
  error: 'color: #dc2626; font-weight: bold;'
};

export const logApiCall = async (
  url: string,
  method: string,
  body?: any,
  customHeaders?: HeadersInit
) => {
  const apiDomain = (window as any).API_DOMAIN || '';
  const fullUrl = url.startsWith('http') ? url : `${apiDomain}${url}`;
  
  console.group(`🌐 API Call: ${method} ${url}`);
  console.log('%cRequest:', logStyles.request, {
    url: fullUrl,
    method,
    headers: customHeaders || {
      'Content-Type': 'application/json'
    },
    body
  });

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: customHeaders || {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    
    console.log('%cResponse:', logStyles.response, {
      status: response.status,
      data
    });
    
    console.groupEnd();
    return data;
  } catch (error) {
    console.log('%cError:', logStyles.error, error);
    console.groupEnd();
    throw error;
  }
};