# Plantify-Frontend
Frontend of Plantify

<h3>From native machine</h3>
```
jdbc:postgresql://localhost:55432/plantify?password=plantifydev&user=dev 
```
<h3>From container</h3>

```
jdbc:postgresql://host.docker.internal:55432/plantify?user=dev&password=plantifydev
```

<h3> In production containers</h3>

```
jdbc:postgresql://postgres:5432/plantify?password=plantifydev&user=dev
```
