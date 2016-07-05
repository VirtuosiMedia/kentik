# Sample Data Visualization UI

This is a sample development environment setup with bare bones login application built with D3.js. The environment setup relies on a number of technologies including VirtualBox, Vagrant, Ansible, NodeJS, Grunt, and Bower. All of those technologies work together to create a consistent development environment with a good development workflow and the ability to have clean dependency management, run tests, build docs, and create a build package to be deployed to a production server.

## Installation

Once each dependency has been installed, upgrades and the development workflow will be streamlined and low impact. These instructions assume OSX, but may also work for Linux with slight adaptation.

### Dependencies

Each of these should be installed globally.

1. [Install Vagrant](https://www.vagrantup.com/downloads.html).
2. [Install VirtualBox](https://www.virtualbox.org/wiki/Downloads).
3. [Install Ansible](http://docs.ansible.com/ansible/intro_installation.html).
4. [Install NodeJS](https://nodejs.org/en/download/stable/). If Node is already installed, make sure it's updated to the latest version.
5. [Install Bower](http://bower.io/#install-bower).
6. Clone this repository to your local machine.

### Environment Setup

First, let's set up the development environment. Starting in the root directory of the application, run the following commands in the console:

```
cd configuration
vagrant up
ansible-playbook setup.yml
```

This will spool up a virtual machine that will run all of the application code. It downloads an Ubuntu 12.04 LTS 64-bit image and install nginx and NodeJS on it. It also maps the `source` directory on your local machine to the `app` directory on the VM, so any changes you make locally will automatically be reflected on the VM. 

The `configuration` directory contains all of the environment configuration files that will be needed to spin up the VM. These files are lightweight and can be stored in source control so that every developer has access to the same development environment. If there are changes to the configuration, one simply needs to run `vagrant destroy` in the `configuration` directory, fetch the changes from the repository, and repeat the commands above.

The next step will be to get SSH access. First, create a `~/.ssh/config` file if it does not already exist. Then, run the following command:

```
vagrant ssh-config
```

Copy the output and paste it into `~/.ssh/config`. Save the file. Now you should be able to SSH into the virtual machine simply by typing `ssh kentik`. In this case, `kentik` is the name of the virtual machine. This will only need to be done once, even if the VM has been built and destroyed multiple times.

Now it's time to start the server, which is done using the ansible playbook. 


```
ansible-playbook setup.yml
```

Now we need to retrieve the IP address for the VM so that the server can be accessed via the browser.

```
ssh kentik
ifconfig
```

The output of the `ifconfig` command will show the IP address we need under the `eth1` section, second line down, labeled `inet addr:`. Copy the IP address and exit the VM by simply typing `exit`. You can paste the IP address into your browser and, if everything has been installed correctly, it should show the sample AngularJS application.

We can take this a step further, though, and [edit the hosts file](http://www.tekrevue.com/tip/edit-hosts-file-mac-os-x/) for your local machine to create an easy to remember alias for the IP address. To do this, open up `/private/etc/hosts` (on OSX), scroll to the bottom, and add the IP address, followed by a space and then `kentik.dev`. Save the file and now you should be able to access the VM via `kentik.dev` in your browser.

**Note**: The current Vagrant configuration of this app assumes a wireless network setup, which may cause the IP to be dynamic, depending on your network configuration. If you are unable to access the IP address later, you may need to reverify the IP by SSHing back into the VM and editing the hosts file again. Vagrant can, however, be easily configured to use a static IP instead.

### Dependency Management

The development workflow and build process rely on proper dependency management, so let's install the remainder of the tools we'll need to set that up. There are 3 directories that are implied by this application infrastructure that are not tracked by git: `bower_components`, `docs`, and `node__modules`. The reason they are not tracked is because they can easily be reconstructed and updated given the configuration files that are already present in the repository, so storing them isn't necessary. This cuts down on project complexity and ensures a cleaner process. We can install/update all dependencies with a single command:

```
npm install
```

This will install all Node dependencies and then will run Bower when it is finished. The dependencies are handled in `package.json` and `bower.json` respectively. If the version of a dependency needs to be incremented, it can be done simply by editing one of those two files.

## Development Workflow

The majority of the development environment setup should only need to be done once. Once setup, the development workflow becomes very easy thanks to Grunt, a task runner. First, let's talk about its current configuration and then about what else can be done. The current configuration allows you to:

- Perform image compression.
- Compile a web icon font from SVG images.

The commands for using Grunt are simple and should be run from the root application directory:

- `grunt build` - generate the build package.

### Future Workflow Possibilities

Without going into great detail, here are a few more things that could be automated with Grunt:

- File dependency management via Bower.
- Auto-generate documentation according to the JSDoc syntax.
- Run unit tests on demand and as part of the build process.
- End to end tests (E2E) using Protractor or Selenium.
- LESS/SASS compilation.
- CSS concatenation and minification.
- Create a build package that concatenates and minifies all application JavaScript files into a single file.
- Lint all JavaScript files.
- Run select commands whenever specified files are changed or when files are added/removed from specified directories.
- Custom template interpolation for localization purposes.