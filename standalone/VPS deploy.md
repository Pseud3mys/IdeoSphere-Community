Guide rapide:
en local:
docker build -t demo-prod-react .
rm .\demo-prod-react.tar
docker save -o demo-prod-react.tar demo-prod-react
scp -P 49200 .\demo-prod-react.tar debian@57.129.68.220:~/

sur VPS:
ssh -p 49200 debian@57.129.68.220
docker load < demo-prod-react.tar
docker stop demo-municipal
docker rm demo-municipal
docker run -d \
    --name demo-municipal \
    --restart always \
    --network web-services \
    demo-prod-react

## 1. Sur votre PC Windows (Local)

1.  **Modifiez votre code** (dans VS Code, etc.).
    
2.  **Construisez la nouvelle image Docker** (en écrasant l'ancienne) :
    
    PowerShell
    
    ```
    docker build -t demo-prod-react .
    
    ```
    
3.  **Testez-la en local** (sur un port différent, ex: 8080) :
    
    PowerShell
    
    ```
    # --rm = se supprime tout seul quand on l'arrête
    docker run -d -p 8080:80 --rm --name react-test demo-prod-react
    
    ```
    
    _Vérifiez sur `http://localhost:8080`._
    
4.  **Arrêtez votre test local :**
    
    PowerShell
    
    ```
    docker stop react-test
    
    ```
    
5.  **Créez le fichier `.tar`** (avec la méthode fiable) :
    
    PowerShell
    
    ```
    # On supprime l'ancien tar
    rm .\demo-prod-react.tar
    
    # On crée le nouveau
    docker save -o demo-prod-react.tar demo-prod-react
    
    ```
    
6.  **Envoyez le `.tar` sur le VPS** (en écrasant l'ancien) :
    
    PowerShell
    
    ```
    scp -P 49200 .\demo-prod-react.tar debian@57.129.68.220:~/
    
    ```
    

----------

## 2. Sur votre VPS Debian (en SSH)

1.  **Connectez-vous au VPS :**
    
    Bash
    
    ```
    ssh -p 49200 debian@57.129.68.220
    
    ```
    
2.  **Chargez la nouvelle image** (Docker va écraser l'ancienne) :
    
    Bash
    
    ```
    docker load < demo-prod-react.tar
    
    ```
    
3.  **Redémarrez le conteneur de production :** _Docker est malin : il va voir que le nom `demo-react-prod` existe déjà. On doit donc l'arrêter, le supprimer, puis le relancer. Il utilisera automatiquement la nouvelle image qu'on vient de charger._
    
    Bash
    
    ```
    # 1. Arrêter l'ancien conteneur
    docker stop demo-municipal
    
    # 2. Supprimer l'ancien conteneur
    docker rm demo-municipal
    
    # 3. Lancer le nouveau (avec la nouvelle image)
    docker run -d \
      --name demo-municipal \
      --restart always \
      --network web-services \
      demo-prod-react
    
    ```
    

C'est tout ! Votre site est à jour.