import sys, os, asyncio
sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/..'))
from services.doc_processor import generate_stunning_pdf

async def main():
    print("starting")
    try:
        await asyncio.to_thread(generate_stunning_pdf, {'personal': {'name': 'Test'}}, 'test.pdf')
        print("done")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
