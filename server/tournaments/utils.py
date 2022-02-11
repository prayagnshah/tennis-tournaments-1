def fill_torunament(tournament):
    """
    Fills the free capacity of the given tournament with
    the available registrations with INTERESTED status.
    """
    registered = tournament.competitors.filter(status="REGISTERED")
    free_capacity = tournament.capacity - registered.count()

    if free_capacity > 0:
        interested = tournament.competitors.filter(status="INTERESTED").order_by(
            "registered_on"
        )[:free_capacity]

        print(interested)

        for instance in interested:
            instance.status = "REGISTERED"
            instance.save()

    elif free_capacity == 0:
        pass
    else:
        for instance in registered.order_by("-registered_on")[: abs(free_capacity)]:
            instance.status = "INTERESTED"
            instance.save()
