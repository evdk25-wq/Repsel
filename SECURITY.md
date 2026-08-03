# Sécurité de Repsel

## Signaler un problème

Les vulnérabilités potentielles peuvent être signalées de manière privée à
`RepselApp@proton.me`. Merci de ne pas publier de détails sensibles dans une
issue GitHub avant qu’un correctif soit disponible.

## Vérifier une release

Les releases officielles fournissent des sommes SHA-256, des signatures
OpenPGP et une attestation de provenance GitHub.

Après avoir téléchargé les fichiers nécessaires :

```bash
sha256sum --ignore-missing --check SHA256SUMS
gpg --import repsel-release-key.asc
gpg --verify SHA256SUMS.asc SHA256SUMS
```

La clé publique principale de Repsel possède l’empreinte :

```text
4BC9 0A4C 58B1 B5EC FD82 AE29 E90C 39C8 07DB C31F
```

Les fichiers sont signés par la sous-clé :

```text
7FAD 8CEE 299D 8BD9 391A 668B 35C6 9B51 FBC4 9696
```

La clé publique est disponible dans chaque release officielle et dans le
fichier [`repsel-release-key.asc`](repsel-release-key.asc) du dépôt.
