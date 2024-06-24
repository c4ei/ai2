from requests import get
import json, sys, g4f

g4f.logging = False
g4f.version_check = False

AvailableProviders = json.loads(sys.argv[1])

try:
    Query = json.loads(sys.argv[2])
except:
    Query = {}

def FormatQueryMessages(Messages: tuple) -> tuple:
    BASE_MESSAGES = [{
        'role': 'system',
        'content': 'You are Ai C4EI, AI.C4EI.NET 은 아직 개발중인 사이트 이며 AAH 코인의 서브 프로젝트 입니다.'
    }]
    return BASE_MESSAGES + [ { 
        'role': Message.get('Role', 'user').lower(), 
        'content': Message.get('Content') } for Message in Messages ] 

def GetProviderData(Provider) -> dict:
    ImportedProvider = ImportProvider(Provider)
    if(ImportedProvider is None):
        return {
            'Name': 'Automatic',
            'Website': 'https://github.com/rodyherrera/Lovelace/',
            'Models': ['gpt-3.5-turbo', 'gpt-4']
        }
    Models = []
    if(ImportedProvider.supports_gpt_35_turbo):
        Models.append('gpt-3.5-turbo')
    if(ImportedProvider.supports_gpt_4):
        Models.append('gpt-4')
    return {
        'Name': Provider,
        'Website': ImportedProvider.url,
        'Models': Models
    }

def ImportProvider(ProviderName: str): 
    if(ProviderName == 'Automatic'):
        return None
    return eval('g4f.Provider.' + ProviderName)

def MainFN() -> None:
    try:
        if sys.argv[3] == 'PROVIDERS':
            print(json.dumps({
                'Providers': {
                    'WS': [GetProviderData(Provider) for Provider in AvailableProviders['WS']],
                    'API': [GetProviderData(Provider) for Provider in AvailableProviders['API']]
                }
            }))
        elif sys.argv[3] == 'API' or sys.argv[3] == 'WS':
            Model = Query['Model']
            Provider = None if Query['Provider'] == 'Automatic' else ImportProvider(Query['Provider'])
            Messages = FormatQueryMessages(Query['Messages'])
            if sys.argv[3] == 'API':
                Response = g4f.ChatCompletion.create(
                    model=Model,
                    provider=Provider, 
                    messages=Messages)
                print(Response.join('\n'))
            else:
                StreamedResponse = g4f.ChatCompletion.create(
                    model=Model,
                    messages=Messages,
                    provider=Provider, 
                    stream=True)
                for Message in StreamedResponse:
                    print(Message, end='', flush=True)
        elif sys.argv[3] == 'VERSION':
            PypiResponse = get("https://pypi.org/pypi/g4f/json").json()
            LatestVersion = PypiResponse["info"]["version"]

            if g4f.version != LatestVersion:
                print('UPDATE')
            else:
                print('UP_TO_DATE')
    except Exception as GPTException:
        print(GPTException)

if __name__ == '__main__':
    MainFN()
