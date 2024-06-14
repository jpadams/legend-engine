import {
    dag,
    Container,
    Directory,
    object,
    func,
} from "@dagger.io/dagger"

@object()
class LegendEngine {
  /**
   * Returns a container for Legend Engine dev
   */
  @func()
  build(source: Directory): Container {
    const ubuntuImage = "ubuntu:jammy-20240530"

    return dag
        .container()//{platform: "linux/amd64" as Platform})
        .from(ubuntuImage)
        .withExec([
            "apt",
            "update",
        ])
        .withExec([
            "apt",
            "install",
            "openjdk-11-jdk",
            "maven",
            "curl",
            "-y",
        ])
        // maven deps cache
        // did not seem worth it to cache target dirs as build often broke
        .withMountedCache(
            "/root/.m2/repository",
            dag.cacheVolume("legend-engine-mvn-cache")
        )
        // mount source
        .withMountedDirectory("/src", source)
        // needs 8GB of heap to build locally
        .withEnvVariable("MAVEN_OPTS", "-Xmx8192m")
        .withWorkdir("/src")
        // other commands to remember
        // .withExec(["mvn", "clean", "install", "-DskipTests"])
        // .withExec(["mvn", "install", "-e", "-X", "-DskipTests"])
        // .withExec(["mvn", "-T", "1C", "install", "-DskipTests", "--offline"])
        .withExec(["mvn", "install", "-DskipTests"])
  }
}
