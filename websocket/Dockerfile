FROM python:latest

WORKDIR /app

ENV PORT=8888
ENV HOST=0.0.0.0
EXPOSE 8888

COPY . .

RUN pip install -r requirements.txt

CMD ["python", "main.py"]