def fill_torunament(tournament):
    """
    Fills the free capacity of the given tournament with
    the available registrations with INTERESTED status.
    """
    registered = tournament.registrations.filter(status="REGISTERED")
    free_capacity = tournament.capacity - registered.count()

    if free_capacity > 0:
        interested = tournament.registrations.filter(status="INTERESTED").order_by(
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


from math import comb


def manage_group_scores(set_stat, GroupScores):
    """Counts the won sets and games score after a set is added.
    When last set is added counts the final order in group"""

    def create_if_not_exists(player, group):
        group_score = GroupScores.objects.filter(player=player, group=group)
        # print(group_score)
        if not group_score:
            group_score = GroupScores(
                player=player,
                group=group,
                tournament=group.tournament,
            )
            group_score.save()

    # Set the defined attributes of group score to 0 to ensure right calculation
    group_scores = GroupScores.objects.filter(group=set_stat.group)
    for group_score in group_scores:
        group_score.sets_won = 0
        group_score.games = 0
        group_score.position = 0
        group_score.save()

    sets = set_stat.group.set_stats.all()

    # Calculating the won sets and games scores afterset
    for tennis_set in sets:
        create_if_not_exists(tennis_set.player_1, tennis_set.group)
        create_if_not_exists(tennis_set.player_2, tennis_set.group)

        group_score_p1 = GroupScores.objects.get(
            player=tennis_set.player_1, group=tennis_set.group
        )
        group_score_p2 = GroupScores.objects.get(
            player=tennis_set.player_2, group=tennis_set.group
        )
        if tennis_set.score_p1 > tennis_set.score_p2:
            group_score_p1.sets_won += 1
        else:
            group_score_p2.sets_won += 1

        group_score_p1.games += tennis_set.score_p1 - tennis_set.score_p2
        group_score_p2.games += tennis_set.score_p2 - tennis_set.score_p1

        group_score_p1.save()
        group_score_p2.save()

    # Setting final order of players after the last match is played
    if len(sets) == comb(len(set_stat.group.players.all()), 2):
        group_scores = GroupScores.objects.filter(group=set_stat.group)
        for position in range(len(group_scores)):
            position += 1
            scores = GroupScores.objects.filter(
                group=set_stat.group, position=0
            ).order_by("-sets_won")
            scores_to_evaluate = scores.filter(sets_won=scores[0].sets_won)
            if len(scores_to_evaluate) == 1:
                winner_score = scores_to_evaluate[0]
                winner_score.position = position
                winner_score.save()
            else:
                scores_to_evaluate = scores_to_evaluate.order_by("-games")
                if scores_to_evaluate[0].games >= scores_to_evaluate[1].games:
                    b2b_set = sets.filter(
                        player_1=scores_to_evaluate[0].player,
                        player_2=scores_to_evaluate[1].player,
                    )
                    if b2b_set:
                        if b2b_set[0].score_p1 > b2b_set[0].score_p2:
                            winner_score = scores_to_evaluate[0]
                            winner_score.position = position
                            winner_score.save()
                        else:
                            winner_score = scores_to_evaluate[1]
                            winner_score.position = position
                            winner_score.save()
                    else:
                        b2b_set = sets.filter(
                            player_1=scores_to_evaluate[1].player,
                            player_2=scores_to_evaluate[0].player,
                        )
                        if b2b_set[0].score_p1 > b2b_set[0].score_p2:
                            winner_score = scores_to_evaluate[1]
                            winner_score.position = position
                            winner_score.save()
                        else:
                            winner_score = scores_to_evaluate[0]
                            winner_score.position = position
                            winner_score.save()

                else:
                    winner_score = scores_to_evaluate[1]
                    winner_score.position = position
                    winner_score.save()
