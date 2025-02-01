FROM node:latest AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM python:3-alpine
COPY --from=build /app/dist /app
WORKDIR /app
EXPOSE 80
CMD ["python", "-m" , "http.server", "80"]
