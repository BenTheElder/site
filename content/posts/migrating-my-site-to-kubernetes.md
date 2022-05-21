---
markup: md
date: "2018-03-04"
title: Migrating My Site to Kubernetes
categories:
- META
- <span class="emoji" style="background-image:url(/images/kubernetes_logo.svg)" title=":kubernetes:"/>:kubernetes:</span>
---
[Previously](/blog/hello-again) when I brought my my site back online I briefly mentioned the simple setup I threw together with Caddy running on a tiny [GCE](https://cloud.google.com/compute/) VM with a few scripts  —  Since then I've had plenty of time to experience the awesomeness that is managing services with [Kubernetes](https://kubernetes.io/) at work while developing Kubernetes's [testing infrastructure](https://github.com/kubernetes/test-infra/) (which we run on [GKE](https://cloud.google.com/kubernetes-engine/)).

So I decided, of course, that it was only natural to migrate my own service(s) to Kubernetes for maximum dog-fooding. <span class="nowrap"><span style="background-image:url(/images/kubernetes_logo.svg)" class="emoji" title=":kubernetes:">:kubernetes:</span> ↔ 🐶

This turned out to be even easier than expected and I was quickly up and running on a toy single-node cluster running on a spare linux box at home with the help of the excellent [official docs for setting up a cluster with kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/).
After that I set up [ingress-nginx](https://github.com/kubernetes/ingress-nginx) to handle ingress to my service(s) and [kube-lego](https://github.com/jetstack/kube-lego) to manage [letsencrypt](https://letsencrypt.org/) certificates. I then replaced Caddy with my own minimal containerized Go service to continue having [GitHub webhooks](https://developer.github.com/webhooks/) trigger site updates. <span style="background-image:url(/images/gopher_favicon.svg)" class="emoji" title=":go_gopher:">:go_gopher:<span>

I did run into the following hiccups:

1) To get DNS resolution within the cluster of external services I needed to [configure kube-dns](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/) with `kubectl apply -f ./k8s/kube-dns-configmap.yaml` where my `./k8s/kube-dns-configmap.yaml` contained:

<div class="tile no-padding sourceCode"><div class="details">k8s/kube-dns-configmap.yaml <span style="float: right">YAML</span></div>

```yaml
# Use Google's public DNS to resolve external services
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-dns
  namespace: kube-system
data:
  upstreamNameservers: |
    ["8.8.8.8", "8.8.4.4"]
```
</div>

2) I also needed to configure [RBAC](https://kubernetes.io/docs/admin/authorization/rbac/) for `kube-lego` which doesn't currently ship with RBAC configured out of the box. Again, this was just involved applying a config update based on the comments at [jetstack/kube-lego#99](https://github.com/jetstack/kube-lego/issues/99) with `kubectl apply -f k8s/kube-lego.yaml`. The config below is probably giving `kube-lego` a lot more access than it needs, but I wasn't particularly concerned about this since this is on a toy "cluster" for my personal site and the service is already managing my TLS certificates. 🤷  

My `k8s/kube-lego.yaml` contained:

<details>

<div class="tile no-padding sourceCode"><div class="details">k8s/kube-lego.yaml <span style="float: right">YAML</span></div>

```yaml
# Complete setup for kube-lego.
# The only thing specific to my cluster here is the lego.email setting,
# the rest is just kube-lego with RBAC.
# Thanks to comments at: https://github.com/jetstack/kube-lego/issues/99
apiVersion: v1
kind: Namespace
metadata:
  name: kube-lego
---
apiVersion: v1
metadata:
  name: kube-lego
  namespace: kube-lego
data:
  # modify this to specify your address
  lego.email: "bentheelder@gmail.com"
  # configure for letsencrypt's production api
  lego.url: "https://acme-v01.api.letsencrypt.org/directory"
kind: ConfigMap
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
    name: lego
rules:
- apiGroups:
  - ""
  - "extensions"
  resources:
  - configmaps
  - secrets
  - services
  - endpoints
  - ingresses
  - nodes
  - pods
  verbs:
  - list
  - get
  - watch
- apiGroups:
  - ""
  resources:
  - services
  verbs:
  - create
- apiGroups:
  - "extensions"
  - ""
  resources:
  - ingresses
  - ingresses/status
  verbs:
  - get
  - update
  - create
  - list
  - patch
  - delete
  - watch
- apiGroups:
  - "*"
  - ""
  resources:
  - events
  - certificates
  - secrets
  verbs:
  - create
  - list
  - update
  - get
  - patch
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: lego
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: lego
subjects:
  - kind: ServiceAccount
    name: lego
    namespace: kube-lego
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: lego
  namespace: kube-lego
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: kube-lego
  namespace: kube-lego
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: kube-lego
    spec:
      serviceAccountName: lego
      containers:
      - name: kube-lego
        image: jetstack/kube-lego:0.1.5
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
        env:
        - name: LEGO_EMAIL
          valueFrom:
            configMapKeyRef:
              name: kube-lego
              key: lego.email
        - name: LEGO_URL
          valueFrom:
            configMapKeyRef:
              name: kube-lego
              key: lego.url
        - name: LEGO_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: LEGO_POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5
          timeoutSeconds: 1
---
```
</div>

</details>

After applying these two changes the rest of [my very simple config](https://github.com/BenTheElder/site/tree/master/k8s) to deploy the Go service
 behind automatic TLS termination worked flawlessly. Since then managing the
site has been an excellent experience with the power of `kubectl`, [the Kubernetes
"swiss army knife"](https://kubernetes.io/docs/user-guide/kubectl-overview/).

In conclusion:

- If you haven't given Kubernetes a try but you are already comfortable with Docker
 you should give it a try. Kubernetes makes managing services *easy and portable*.
The same `kubectl` commands I use to debug our services for the Kubernetes project's
 infrastructure on GKE work just as well on my toy cluster at home. 😄

- If you want to give hosting on Kubernetes a try with much less effort, [Google Cloud](https://cloud.google.com/) offers [a free 12 month, $300 credit](https://cloud.google.com/free/) and an [always-free tier](https://cloud.google.com/free/) which both include [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/).  
We use GKE heavily for the project infrastructure and I can speak highly to it's ease of use
 and freedom to focus on your services without worrying about setting up and maintaining all of the pluggable Kubernetes bits such as [logging](https://kubernetes.io/docs/tasks/debug-application-cluster/logging-stackdriver/), [master upgrades](https://cloud.google.com/kubernetes-engine/docs/clusters/upgrade), [node auto repair](https://cloud.google.com/kubernetes-engine/docs/node-auto-repair), [IAM](https://cloud.google.com/iam/), [cluster networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/#google-compute-engine-gce), etc. 

If my site were a serious production service instead of a toy learning experience I would seriously look towards GKE instead of a one node "cluster" running on a DIY "server" sitting by my desk at home, but setting up a toy cluster with `kubeadm` was a great experience for experimenting with Kubernetes. I can recommend using kubeadm for similar experiments, it's quite simple to use once you have all the prerequesites installed and configured and the docs are quite good, however it won't solve many of the things you'll want for a production cluster.

You may also want to look around the list of the many [CNCF certified Kubernetes conformant products](https://www.cncf.io/certification/software-conformance/) for other options if for some reason neither of these sound appealing to you. 

If you really just want to play with it first (and not host anything), check out [minikube](https://github.com/kubernetes/minikube).

## Addendum

- I also used [Calico](https://www.projectcalico.org/) for my overlay network, but I haven't really exercised it yet so I can't really comment on it.

- Kubernetes [secrets](https://kubernetes.io/docs/concepts/configuration/secret/) are awesome. My simple Go service can just read in the GitHub webhook secret as an environment variable injected into the container without worrying about how the secret is loaded and stored.

- To get a one node cluster working you need to [remove the master taint](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#master-isolation). This is terrible idea for a production cluster but great for tinkering and effectively using kubelet as your PID1.

{{% update %}} My site [is on Netlify now](/posts/gitops-all-the-things/), but I still run my own Kubernetes cluster to host other small projects. Hosting it on a toy Kubernetes cluster worked well, except when the power went out at my apartment ... I'd like my site to be online even then, hence Netlify 🙃{{% /update %}}

{{% update %}} I've since simplified my home server further to minimize time spent on upkeep, my website remains on Netlify since the last update. If you're interested, you can read more on that in "[Self-Driving Debian](/posts/self-driving-debian/)".

I would still recommend considering Kubernetes for larger application infrastructure management, but unless you are doing so for educational purposes, I'm not sure I'd recommend it for simple small-scale deployments ... Your results may vary.{{% /update %}}